"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getCourses } from "@/lib/courses-server";
import { lessonCount } from "@/lib/courses";

export type GoalStatus = "completed" | "on-track" | "behind" | "no-goal";

export type StudyPlanItem = {
  courseSlug: string;
  courseTitle: string;
  cover: string;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  enrolledAt: string;
  targetDate: string | null;
  daysRemaining: number | null;
  status: GoalStatus;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function computeStatus(
  progressPct: number,
  enrolledAt: Date,
  targetDate: Date | null,
): GoalStatus {
  if (progressPct >= 100) return "completed";
  if (!targetDate) return "no-goal";

  const now = new Date();
  const totalSpan = targetDate.getTime() - enrolledAt.getTime();
  const elapsed = now.getTime() - enrolledAt.getTime();

  if (now > targetDate) return "behind";
  if (totalSpan <= 0) return progressPct >= 100 ? "completed" : "behind";

  const expectedPct = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
  return progressPct >= expectedPct - 10 ? "on-track" : "behind";
}

/** Every course the current user is enrolled in, with completion progress and goal status. */
export async function getStudyPlan(): Promise<StudyPlanItem[]> {
  const { userId } = await verifySession();

  const [enrollments, courses, goals, completions] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId } }),
    getCourses(),
    prisma.goal.findMany({ where: { userId } }),
    prisma.lessonCompletion.findMany({ where: { userId } }),
  ]);

  const goalBySlug = new Map(goals.map((g) => [g.courseSlug, g]));
  const coursesBySlug = new Map(courses.map((c) => [c.slug, c]));

  const completedBySlug = new Map<string, number>();
  for (const c of completions) {
    completedBySlug.set(c.courseSlug, (completedBySlug.get(c.courseSlug) ?? 0) + 1);
  }

  return enrollments
    .map((enrollment) => {
      const course = coursesBySlug.get(enrollment.courseSlug);
      if (!course) return null;

      const total = lessonCount(course);
      const done = completedBySlug.get(enrollment.courseSlug) ?? 0;
      const progressPct = total ? Math.round((done / total) * 100) : 0;
      const goal = goalBySlug.get(enrollment.courseSlug);
      const targetDate = goal?.targetDate ?? null;

      const daysRemaining = targetDate
        ? Math.ceil((targetDate.getTime() - Date.now()) / MS_PER_DAY)
        : null;

      return {
        courseSlug: course.slug,
        courseTitle: course.title,
        cover: course.cover,
        totalLessons: total,
        completedLessons: done,
        progressPct,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        targetDate: targetDate ? targetDate.toISOString() : null,
        daysRemaining,
        status: computeStatus(progressPct, enrollment.enrolledAt, targetDate),
      } satisfies StudyPlanItem;
    })
    .filter((item): item is StudyPlanItem => item !== null)
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
}

/** Sets or updates the target completion date for one of the user's enrolled courses. */
export async function setGoalTargetDate(
  courseSlug: string,
  targetDate: string,
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await verifySession();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId, courseSlug } },
  });
  if (!enrollment) {
    return { success: false, error: "Not enrolled in this course" };
  }

  const parsed = new Date(targetDate);
  if (Number.isNaN(parsed.getTime())) {
    return { success: false, error: "Invalid date" };
  }

  await prisma.goal.upsert({
    where: { userId_courseSlug: { userId, courseSlug } },
    create: { userId, courseSlug, targetDate: parsed },
    update: { targetDate: parsed },
  });

  revalidatePath("/study-planner");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Removes the goal (target date) for a course, without affecting enrollment/progress. */
export async function clearGoal(courseSlug: string): Promise<void> {
  const { userId } = await verifySession();
  await prisma.goal.deleteMany({ where: { userId, courseSlug } });
  revalidatePath("/study-planner");
  revalidatePath("/dashboard");
}
