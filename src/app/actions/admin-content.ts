"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export async function saveCourseAction(courseData: any) {
  await requireAdmin();

  const { slug, title, subtitle, category, instructor, cover, description, price, modules } = courseData;
  if (!slug || !title) throw new Error("Missing required fields");

  await prisma.$transaction(async (tx) => {
    // Delete existing course if it exists (cascade takes care of modules/lessons)
    const existing = await tx.course.findUnique({ where: { slug } });
    if (existing) {
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
  await requireAdmin();
  await prisma.course.delete({ where: { slug } });
  
  revalidatePath("/");
  revalidatePath("/my-courses");
  return { success: true };
}

export async function savePracticeExamAction(examData: any) {
  await requireAdmin();
  const { categorySlug, categoryName, durationMinutes, questions } = examData;
  if (!categorySlug || !categoryName) throw new Error("Missing required fields");

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
  await requireAdmin();
  await prisma.practiceExam.delete({ where: { categorySlug } });
  
  revalidatePath("/aptitude");
  revalidatePath("/aptitude/practice-exam");
  return { success: true };
}
