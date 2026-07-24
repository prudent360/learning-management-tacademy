"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, getOptionalSession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE"];

async function assertCohortAccess(cohortId: string) {
  const admin = await requirePermission("courses:view");
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { course: { select: { instructorUserId: true } } },
  });
  if (!cohort) return { admin, cohort: null };
  if (admin.category === "INSTRUCTOR" && cohort.course.instructorUserId !== admin.id) {
    throw new Error("You can only manage attendance for cohorts assigned to you.");
  }
  return { admin, cohort };
}

// ---------- Admin/instructor-facing ----------

export type RosterEntry = {
  userId: string;
  userName: string;
  userEmail: string;
  status: AttendanceStatus | null;
  note: string | null;
};

/** `date` is a "YYYY-MM-DD" string — a session is just whatever date attendance is taken for. */
export async function getCohortRoster(cohortId: string, date: string): Promise<RosterEntry[]> {
  const { cohort } = await assertCohortAccess(cohortId);
  if (!cohort) return [];

  const day = new Date(date);
  const [enrollments, attendance] = await Promise.all([
    prisma.enrollment.findMany({
      where: { cohortId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.attendance.findMany({ where: { cohortId, date: day } }),
  ]);

  const byUser = new Map(attendance.map((a) => [a.userId, a]));
  return enrollments.map((e) => {
    const a = byUser.get(e.user.id);
    return {
      userId: e.user.id,
      userName: e.user.name,
      userEmail: e.user.email,
      status: a?.status ?? null,
      note: a?.note ?? null,
    };
  });
}

export async function markAttendanceAction(
  cohortId: string,
  date: string,
  records: { userId: string; status: AttendanceStatus; note?: string }[],
): Promise<ActionResult> {
  const { admin, cohort } = await assertCohortAccess(cohortId);
  if (!cohort) return { success: false, error: "Cohort not found." };

  const day = new Date(date);
  if (Number.isNaN(day.getTime())) return { success: false, error: "Invalid date." };
  if (records.some((r) => !STATUSES.includes(r.status))) {
    return { success: false, error: "Invalid attendance status." };
  }

  await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { cohortId_userId_date: { cohortId, userId: r.userId, date: day } },
        update: { status: r.status, note: r.note || null, markedById: admin.id },
        create: {
          cohortId,
          userId: r.userId,
          date: day,
          status: r.status,
          note: r.note || null,
          markedById: admin.id,
        },
      }),
    ),
  );

  revalidatePath(`/admin/courses/${cohort.courseSlug}/cohorts/${cohortId}/attendance`);
  return { success: true };
}

/** Every date attendance has been taken for this cohort, newest first — lets the admin jump back to edit a past session. */
export async function listAttendanceDates(cohortId: string): Promise<string[]> {
  const { cohort } = await assertCohortAccess(cohortId);
  if (!cohort) return [];
  const rows = await prisma.attendance.findMany({
    where: { cohortId },
    distinct: ["date"],
    select: { date: true },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => r.date.toISOString().slice(0, 10));
}

// ---------- Student-facing ----------

export type MyAttendanceSummary = {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalSessions: number;
  /** Present + late counted as "attended", out of every session held so far. */
  percent: number;
  history: { date: Date; status: AttendanceStatus }[];
};

export async function getMyAttendance(courseSlug: string): Promise<MyAttendanceSummary | null> {
  const session = await getOptionalSession();
  if (!session) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });
  if (!enrollment?.cohortId) return null;

  const records = await prisma.attendance.findMany({
    where: { cohortId: enrollment.cohortId, userId: session.userId },
    orderBy: { date: "desc" },
  });
  if (records.length === 0) return null;

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const totalSessions = records.length;

  return {
    presentCount,
    absentCount,
    lateCount,
    totalSessions,
    percent: Math.round(((presentCount + lateCount) / totalSessions) * 100),
    history: records.slice(0, 8).map((r) => ({ date: r.date, status: r.status })),
  };
}
