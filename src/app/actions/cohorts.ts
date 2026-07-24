"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

const CohortSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  startDate: z.string().min(1, { error: "Start date is required." }),
  endDate: z.string().min(1, { error: "End date is required." }),
  enrollmentDeadline: z.string().optional(),
  orientationDate: z.string().optional(),
  capacity: z.union([z.number(), z.null()]).optional(),
  timezone: z.string().trim(),
  schedule: z.string().trim(),
  instructorUserId: z.string().nullable().optional(),
});

export type CohortInput = z.infer<typeof CohortSchema>;

export type CohortRow = {
  id: string;
  courseSlug: string;
  name: string;
  startDate: Date;
  endDate: Date;
  enrollmentDeadline: Date | null;
  orientationDate: Date | null;
  capacity: number | null;
  timezone: string;
  schedule: string;
  status: "UPCOMING" | "ENROLLMENT_OPEN" | "ONGOING" | "COMPLETED" | "ARCHIVED";
  instructorUserId: string | null;
  instructorName: string | null;
  enrolledCount: number;
};

/** Unauthenticated existence check — a course with any cohort (even a completed/archived one) uses the apply/admit model instead of instant self-paced enrollment. */
export async function courseUsesCohorts(courseSlug: string): Promise<boolean> {
  const count = await prisma.cohort.count({ where: { courseSlug } });
  return count > 0;
}

export type PublicCohortSummary = {
  name: string;
  startDate: Date;
  status: CohortRow["status"];
  seatsRemaining: number | null; // null = unlimited/uncapped
  enrollmentOpen: boolean;
};

/** Unauthenticated read for the public program page — surfaces whichever cohort is most relevant to a prospective student, never COMPLETED/ARCHIVED ones. */
export async function getPublicNextCohort(courseSlug: string): Promise<PublicCohortSummary | null> {
  const cohorts = await prisma.cohort.findMany({
    where: { courseSlug, status: { in: ["ENROLLMENT_OPEN", "UPCOMING", "ONGOING"] } },
    include: { _count: { select: { enrollments: true } } },
  });
  if (cohorts.length === 0) return null;

  const priority: Record<string, number> = { ENROLLMENT_OPEN: 0, UPCOMING: 1, ONGOING: 2 };
  cohorts.sort((a, b) => {
    const diff = priority[a.status] - priority[b.status];
    if (diff !== 0) return diff;
    // Ongoing cohorts: most recently started first. Everything else: soonest start first.
    return a.status === "ONGOING"
      ? b.startDate.getTime() - a.startDate.getTime()
      : a.startDate.getTime() - b.startDate.getTime();
  });

  const best = cohorts[0];
  return {
    name: best.name,
    startDate: best.startDate,
    status: best.status,
    seatsRemaining: best.capacity != null ? Math.max(best.capacity - best._count.enrollments, 0) : null,
    enrollmentOpen: best.status === "ENROLLMENT_OPEN",
  };
}

async function assertCourseAccess(courseSlug: string) {
  const admin = await requirePermission("courses:view");
  if (admin.category === "INSTRUCTOR") {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: { instructorUserId: true },
    });
    if (course?.instructorUserId !== admin.id) {
      throw new Error("You can only manage cohorts for courses assigned to you.");
    }
  }
  return admin;
}

export async function listCohorts(courseSlug: string): Promise<CohortRow[]> {
  await assertCourseAccess(courseSlug);
  const cohorts = await prisma.cohort.findMany({
    where: { courseSlug },
    include: {
      instructorUser: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return cohorts.map((c) => ({
    id: c.id,
    courseSlug: c.courseSlug,
    name: c.name,
    startDate: c.startDate,
    endDate: c.endDate,
    enrollmentDeadline: c.enrollmentDeadline,
    orientationDate: c.orientationDate,
    capacity: c.capacity,
    timezone: c.timezone,
    schedule: c.schedule,
    status: c.status,
    instructorUserId: c.instructorUserId,
    instructorName: c.instructorUser?.name ?? null,
    enrolledCount: c._count.enrollments,
  }));
}

function parseCohortInput(input: CohortInput) {
  const parsed = CohortSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message, data: undefined };

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Start and end dates must be valid.", data: undefined };
  }
  if (endDate < startDate) {
    return { error: "End date can't be before the start date.", data: undefined };
  }

  return {
    error: undefined,
    data: {
      name: parsed.data.name,
      startDate,
      endDate,
      enrollmentDeadline: parsed.data.enrollmentDeadline ? new Date(parsed.data.enrollmentDeadline) : null,
      orientationDate: parsed.data.orientationDate ? new Date(parsed.data.orientationDate) : null,
      capacity: parsed.data.capacity ?? null,
      timezone: parsed.data.timezone || "UTC",
      schedule: parsed.data.schedule,
      instructorUserId: parsed.data.instructorUserId || null,
    },
  };
}

export async function createCohortAction(courseSlug: string, input: CohortInput): Promise<ActionResult> {
  await assertCourseAccess(courseSlug);
  const parsed = parseCohortInput(input);
  if (parsed.error || !parsed.data) return { success: false, error: parsed.error ?? "Invalid input." };

  await prisma.cohort.create({ data: { courseSlug, ...parsed.data } });
  revalidatePath(`/admin/courses/${courseSlug}/cohorts`);
  return { success: true };
}

export async function updateCohortAction(id: string, input: CohortInput): Promise<ActionResult> {
  const cohort = await prisma.cohort.findUnique({ where: { id }, select: { courseSlug: true } });
  if (!cohort) return { success: false, error: "Cohort not found." };
  await assertCourseAccess(cohort.courseSlug);

  const parsed = parseCohortInput(input);
  if (parsed.error || !parsed.data) return { success: false, error: parsed.error ?? "Invalid input." };

  await prisma.cohort.update({ where: { id }, data: parsed.data });
  revalidatePath(`/admin/courses/${cohort.courseSlug}/cohorts`);
  return { success: true };
}

export async function duplicateCohortAction(id: string): Promise<ActionResult> {
  const cohort = await prisma.cohort.findUnique({ where: { id } });
  if (!cohort) return { success: false, error: "Cohort not found." };
  await assertCourseAccess(cohort.courseSlug);

  await prisma.cohort.create({
    data: {
      courseSlug: cohort.courseSlug,
      name: `${cohort.name} (Copy)`,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      enrollmentDeadline: cohort.enrollmentDeadline,
      orientationDate: cohort.orientationDate,
      capacity: cohort.capacity,
      timezone: cohort.timezone,
      schedule: cohort.schedule,
      instructorUserId: cohort.instructorUserId,
      status: "UPCOMING",
    },
  });
  revalidatePath(`/admin/courses/${cohort.courseSlug}/cohorts`);
  return { success: true };
}

export async function setCohortStatusAction(
  id: string,
  status: CohortRow["status"],
): Promise<ActionResult> {
  const cohort = await prisma.cohort.findUnique({ where: { id }, select: { courseSlug: true } });
  if (!cohort) return { success: false, error: "Cohort not found." };
  await assertCourseAccess(cohort.courseSlug);

  await prisma.cohort.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/courses/${cohort.courseSlug}/cohorts`);
  return { success: true };
}
