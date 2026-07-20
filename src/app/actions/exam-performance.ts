"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

const PASS_THRESHOLD = 80;

export type ScoreTrendPoint = {
  month: string;
  yourScore: number | null;
  siteAverage: number | null;
};

export type CategoryPerformance = {
  slug: string;
  name: string;
  attempts: number;
  avgScore: number;
  bestScore: number;
  passRate: number;
  trend: number[];
};

export type RecentAttempt = {
  id: string;
  category: string;
  scorePercent: number;
  timeSpentSeconds: number;
  completedAt: string;
  passed: boolean;
};

export type ExamPerformance = {
  totalAttempts: number;
  avgScore: number;
  passRate: number;
  bestCategory: string | null;
  scoreTrend: ScoreTrendPoint[];
  categories: CategoryPerformance[];
  recentAttempts: RecentAttempt[];
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
};
const avg = (nums: number[]) =>
  nums.length ? Math.round(nums.reduce((s, n) => s + n, 0) / nums.length) : null;

/** The current student's own exam performance: score trend vs. site average, per-category breakdown, and recent attempts. */
export async function getExamPerformance(): Promise<ExamPerformance> {
  const { userId } = await verifySession();

  const [myAttempts, allAttempts, exams] = await Promise.all([
    prisma.examAttempt.findMany({ where: { userId }, orderBy: { completedAt: "asc" } }),
    prisma.examAttempt.findMany({ select: { scorePercent: true, completedAt: true } }),
    prisma.practiceExam.findMany({ select: { categorySlug: true, categoryName: true } }),
  ]);

  const categoryName = new Map(exams.map((e) => [e.categorySlug, e.categoryName]));

  const totalAttempts = myAttempts.length;
  const avgScore = avg(myAttempts.map((a) => a.scorePercent)) ?? 0;
  const passRate = totalAttempts
    ? Math.round(
        (myAttempts.filter((a) => a.scorePercent >= PASS_THRESHOLD).length / totalAttempts) * 100,
      )
    : 0;

  // Monthly trend: your average score vs. the site-wide average score, last 12 months with data.
  const myByMonth = new Map<string, number[]>();
  for (const a of myAttempts) {
    const k = monthKey(a.completedAt);
    if (!myByMonth.has(k)) myByMonth.set(k, []);
    myByMonth.get(k)!.push(a.scorePercent);
  }
  const allByMonth = new Map<string, number[]>();
  for (const a of allAttempts) {
    const k = monthKey(a.completedAt);
    if (!allByMonth.has(k)) allByMonth.set(k, []);
    allByMonth.get(k)!.push(a.scorePercent);
  }
  const monthKeys = Array.from(new Set([...myByMonth.keys(), ...allByMonth.keys()]))
    .sort()
    .slice(-12);

  const scoreTrend: ScoreTrendPoint[] = monthKeys.map((k) => ({
    month: monthLabel(k),
    yourScore: avg(myByMonth.get(k) ?? []),
    siteAverage: avg(allByMonth.get(k) ?? []),
  }));

  // Per-category breakdown, based only on this student's attempts.
  const bySlug = new Map<string, typeof myAttempts>();
  for (const a of myAttempts) {
    if (!bySlug.has(a.examSlug)) bySlug.set(a.examSlug, []);
    bySlug.get(a.examSlug)!.push(a);
  }
  const categories: CategoryPerformance[] = Array.from(bySlug.entries())
    .map(([slug, attempts]) => {
      const scores = attempts.map((a) => a.scorePercent);
      return {
        slug,
        name: categoryName.get(slug) ?? slug,
        attempts: attempts.length,
        avgScore: avg(scores) ?? 0,
        bestScore: Math.max(...scores),
        passRate: Math.round(
          (scores.filter((s) => s >= PASS_THRESHOLD).length / scores.length) * 100,
        ),
        trend: scores.slice(-8),
      };
    })
    .sort((a, b) => b.attempts - a.attempts);

  const bestCategory = categories.length
    ? categories.reduce((best, c) => (c.avgScore > best.avgScore ? c : best)).name
    : null;

  const recentAttempts: RecentAttempt[] = myAttempts
    .slice(-10)
    .reverse()
    .map((a) => ({
      id: a.id,
      category: categoryName.get(a.examSlug) ?? a.examSlug,
      scorePercent: a.scorePercent,
      timeSpentSeconds: a.timeSpentSeconds,
      completedAt: a.completedAt.toISOString(),
      passed: a.scorePercent >= PASS_THRESHOLD,
    }));

  return { totalAttempts, avgScore, passRate, bestCategory, scoreTrend, categories, recentAttempts };
}
