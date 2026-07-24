"use server";

import { prisma } from "@/lib/prisma";
import { getOptionalSession } from "@/lib/dal";

export type JourneyStageStatus = "complete" | "current" | "upcoming";

export type JourneyStage = {
  key: string;
  label: string;
  status: JourneyStageStatus;
  date?: Date | null;
};

export type JourneySummary = {
  cohortName: string;
  stages: JourneyStage[];
};

const MAX_WEEKS = 12; // guards against absurdly long lists for year-long cohorts
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Derived entirely from data that already exists (Cohort dates, Application,
 * Certificate) — no new schema. Only returns a summary for students enrolled
 * in a cohort-bearing program; self-paced courses (no cohort) get null, and
 * the caller should just skip rendering the timeline in that case.
 *
 * Internship is deliberately not a stage here yet — there's no Internship
 * model until that phase ships, and fabricating a status for it would be
 * dishonest. It'll slot in between "Capstone" and "Certificate" once real
 * data exists to back it.
 */
export async function getMyJourney(courseSlug: string): Promise<JourneySummary | null> {
  const session = await getOptionalSession();
  if (!session) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
    include: { cohort: true },
  });
  if (!enrollment?.cohort) return null;
  const cohort = enrollment.cohort;

  const [application, certificate] = await Promise.all([
    prisma.application.findUnique({
      where: { userId_courseSlug: { userId: session.userId, courseSlug } },
    }),
    prisma.certificate.findUnique({
      where: { userId_courseSlug: { userId: session.userId, courseSlug } },
    }),
  ]);

  const now = new Date();
  const stages: JourneyStage[] = [];

  stages.push({ key: "registration", label: "Registration", status: "complete" });
  stages.push({
    key: "admission",
    label: "Admission",
    status: "complete",
    date: application?.reviewedAt ?? null,
  });

  if (cohort.orientationDate) {
    stages.push({
      key: "orientation",
      label: "Orientation",
      status: now >= cohort.orientationDate ? "complete" : "upcoming",
      date: cohort.orientationDate,
    });
  }

  const totalWeeks = Math.min(
    MAX_WEEKS,
    Math.max(1, Math.round((cohort.endDate.getTime() - cohort.startDate.getTime()) / WEEK_MS)),
  );
  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = new Date(cohort.startDate.getTime() + (week - 1) * WEEK_MS);
    const weekEnd = new Date(weekStart.getTime() + WEEK_MS);
    stages.push({
      key: `week-${week}`,
      label: `Week ${week}`,
      status: now >= weekEnd ? "complete" : now >= weekStart ? "current" : "upcoming",
      date: weekStart,
    });
  }

  stages.push({
    key: "capstone",
    label: "Capstone Project",
    status: now >= cohort.endDate ? "complete" : "upcoming",
  });
  stages.push({
    key: "graduation",
    label: "Graduation",
    status: now >= cohort.endDate ? "complete" : "upcoming",
    date: cohort.endDate,
  });
  stages.push({
    key: "certificate",
    label: "Certificate",
    status: certificate ? "complete" : "upcoming",
    date: certificate?.dateIssued ?? null,
  });
  stages.push({
    key: "alumni",
    label: "Alumni",
    status: certificate && now >= cohort.endDate ? "complete" : "upcoming",
  });

  // Exactly one "current" stage: the first non-complete one, unless every
  // stage is already complete (in which case nothing needs highlighting).
  let seenIncomplete = false;
  for (const stage of stages) {
    if (stage.status === "complete") continue;
    if (!seenIncomplete) {
      stage.status = "current";
      seenIncomplete = true;
    } else {
      stage.status = "upcoming";
    }
  }

  return { cohortName: cohort.name, stages };
}
