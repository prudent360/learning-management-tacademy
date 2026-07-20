"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export async function saveCourseAction(courseData: any) {
  const { slug, title, subtitle, category, instructor, instructorUserId, cover, description, price, modules } =
    courseData;
  if (!slug || !title) throw new Error("Missing required fields");

  const existingCourse = await prisma.course.findUnique({ where: { slug } });
  const admin = await requirePermission(existingCourse ? "courses:edit" : "courses:create");

  if (
    admin.category === "INSTRUCTOR" &&
    existingCourse &&
    existingCourse.instructorUserId !== admin.id
  ) {
    throw new Error("You can only edit courses assigned to you.");
  }

  await prisma.$transaction(async (tx) => {
    // Delete existing course if it exists (cascade takes care of modules/lessons)
    if (existingCourse) {
      await tx.course.delete({ where: { slug } });
    }

    // Create course
    await tx.course.create({
      data: {
        slug,
        title,
        subtitle,
        category,
        instructor,
        instructorUserId: instructorUserId || null,
        cover,
        description,
        price: Number(price) || 0,
        modules: {
          create: modules.map((m: any) => ({
            moduleId: m.id || m.moduleId,
            title: m.title,
            lessons: {
              create: (m.lessons || []).map((l: any) => ({
                lessonId: l.id || l.lessonId,
                title: l.title,
                type: l.type.toUpperCase() as any,
                duration: Number(l.duration) || 0,
                content: JSON.stringify(l.content || []),
                videoUrl: l.videoUrl || "",
                questions: {
                  create: (l.questions || []).map((q: any) => ({
                    questionId: q.id || q.questionId,
                    prompt: q.prompt,
                    options: JSON.stringify(q.options || []),
                    correctId: q.correctId,
                    explanation: q.explanation || "",
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/my-courses");
  revalidatePath(`/courses/${slug}`);
  return { success: true };
}

export async function deleteCourseAction(slug: string) {
  await requirePermission("courses:delete");
  await prisma.course.delete({ where: { slug } });
  
  revalidatePath("/");
  revalidatePath("/my-courses");
  return { success: true };
}

export async function savePracticeExamAction(examData: any) {
  const { categorySlug, categoryName, durationMinutes, questions } = examData;
  if (!categorySlug || !categoryName) throw new Error("Missing required fields");

  const existing = await prisma.practiceExam.findUnique({ where: { categorySlug } });
  await requirePermission(existing ? "exams:edit" : "exams:create");

  await prisma.$transaction(async (tx) => {
    await tx.practiceExam.upsert({
      where: { categorySlug },
      update: {
        categoryName,
        durationMinutes: Number(durationMinutes) || 0,
      },
      create: {
        categorySlug,
        categoryName,
        durationMinutes: Number(durationMinutes) || 0,
      },
    });

    await tx.examQuestion.deleteMany({ where: { examSlug: categorySlug } });

    for (const q of questions) {
      await tx.examQuestion.create({
        data: {
          questionId: q.id || q.questionId,
          prompt: q.prompt,
          options: JSON.stringify(q.options || []),
          correctId: q.correctId,
          explanation: q.explanation || "",
          examSlug: categorySlug,
        },
      });
    }
  });

  revalidatePath("/aptitude");
  revalidatePath("/aptitude/practice-exam");
  return { success: true };
}

export async function deletePracticeExamAction(categorySlug: string) {
  await requirePermission("exams:delete");
  await prisma.practiceExam.delete({ where: { categorySlug } });
  
  revalidatePath("/aptitude");
  revalidatePath("/aptitude/practice-exam");
  return { success: true };
}
