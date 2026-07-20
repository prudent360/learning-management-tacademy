"use server";

import { prisma } from "@/lib/prisma";
import { verifySession, requireAdmin } from "@/lib/dal";

export async function saveExamAttemptAction(
  examSlug: string,
  scorePercent: number,
  timeSpentSeconds: number
) {
  const { userId } = await verifySession();

  await prisma.examAttempt.create({
    data: {
      userId,
      examSlug,
      scorePercent,
      timeSpentSeconds,
    },
  });

  return { success: true };
}

export type CourseStatEntry = {
  slug: string;
  title: string;
  totalLessons: number;
  studentsEnrolled: number;
  averageCompletion: number;
};

export type ExamCategoryStatEntry = {
  slug: string;
  name: string;
  attemptsCount: number;
  averageScore: number;
  passRate: number;
};

export type RecentAttemptEntry = {
  id: string;
  scorePercent: number;
  timeSpentSeconds: number;
  completedAt: Date;
  examSlug: string;
  user: {
    name: string;
    email: string;
  };
};

export type AnalyticsDashboardData = {
  totalStudents: number;
  totalEnrollments: number;
  overallCompletionRate: number;
  totalAttempts: number;
  overallPassRate: number;
  averageScore: number;
  courseStats: CourseStatEntry[];
  categoryStats: ExamCategoryStatEntry[];
  recentAttempts: RecentAttemptEntry[];
};

export async function getAnalyticsAction(): Promise<AnalyticsDashboardData> {
  await requireAdmin();

  // Fetch student users
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      lessonCompletions: true,
      attempts: true,
    },
  });

  // Fetch courses
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  // Fetch exams
  const exams = await prisma.practiceExam.findMany();

  // Fetch recent attempts
  const recentAttemptsRaw = await prisma.examAttempt.findMany({
    orderBy: { completedAt: "desc" },
    take: 10,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Filter and map recent attempts
  const recentAttempts: RecentAttemptEntry[] = recentAttemptsRaw.map((r) => ({
    id: r.id,
    scorePercent: r.scorePercent,
    timeSpentSeconds: r.timeSpentSeconds,
    completedAt: r.completedAt,
    examSlug: r.examSlug,
    user: {
      name: r.user.name,
      email: r.user.email,
    },
  }));

  // Calculations
  const totalStudents = students.length;
  
  // Total enrollments: student has started at least one course
  const totalEnrollments = students.filter((s) => s.lessonCompletions.length > 0).length;

  const courseStats: CourseStatEntry[] = courses.map((course) => {
    let totalLessons = 0;
    course.modules.forEach((mod) => {
      totalLessons += mod.lessons.length;
    });

    const startedStudents = students.filter((s) =>
      s.lessonCompletions.some((c) => c.courseSlug === course.slug)
    );

    const completionRates = startedStudents.map((s) => {
      const completed = s.lessonCompletions.filter((c) => c.courseSlug === course.slug).length;
      return totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
    });

    const averageCompletion =
      completionRates.length > 0
        ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
        : 0;

    return {
      slug: course.slug,
      title: course.title,
      totalLessons,
      studentsEnrolled: completionRates.length,
      averageCompletion: Math.round(averageCompletion),
    };
  });

  const overallCompletionRate =
    courseStats.length > 0
      ? Math.round(
          courseStats.reduce((acc, c) => acc + c.averageCompletion, 0) / courseStats.length
        )
      : 0;

  // Exam stats
  const allAttempts = students.flatMap((s) => s.attempts);
  const totalAttempts = allAttempts.length;
  
  const averageScore =
    totalAttempts > 0
      ? Math.round(allAttempts.reduce((acc, a) => acc + a.scorePercent, 0) / totalAttempts)
      : 0;

  const passAttempts = allAttempts.filter((a) => a.scorePercent >= 80).length;
  const overallPassRate =
    totalAttempts > 0 ? Math.round((passAttempts / totalAttempts) * 100) : 0;

  const categoryStats: ExamCategoryStatEntry[] = exams.map((ex) => {
    const attemptsForCategory = allAttempts.filter((a) => a.examSlug === ex.categorySlug);
    const count = attemptsForCategory.length;
    const categoryAvg =
      count > 0 ? attemptsForCategory.reduce((acc, a) => acc + a.scorePercent, 0) / count : 0;
    const categoryPass = attemptsForCategory.filter((a) => a.scorePercent >= 80).length;
    const categoryPassRate = count > 0 ? (categoryPass / count) * 100 : 0;

    return {
      slug: ex.categorySlug,
      name: ex.categoryName,
      attemptsCount: count,
      averageScore: Math.round(categoryAvg),
      passRate: Math.round(categoryPassRate),
    };
  });

  return {
    totalStudents,
    totalEnrollments,
    overallCompletionRate,
    totalAttempts,
    overallPassRate,
    averageScore,
    courseStats,
    categoryStats,
    recentAttempts,
  };
}
