"use server";

import { verifySession } from "@/lib/dal";
import { getPracticeExam, getPracticeExams } from "@/lib/courses-server";

export async function getExamBySlugAction(categorySlug: string) {
  await verifySession();
  const exam = await getPracticeExam(categorySlug);
  return exam ?? null;
}

export async function getAllExamsAction() {
  await verifySession();
  const exams = await getPracticeExams();
  return Object.values(exams);
}

export async function getSearchCoursesAction() {
  await verifySession();
  const { getCourses } = await import("@/lib/courses-server");
  const courses = await getCourses();
  return courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    category: c.category,
  }));
}

