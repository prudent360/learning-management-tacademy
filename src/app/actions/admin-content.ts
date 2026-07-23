"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const COURSE_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "courses");

export async function uploadCourseThumbnailAction(
  formData: FormData
): Promise<{ success: true; path: string } | { success: false; error: string }> {
  await requirePermission("courses:create");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose an image file to upload." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be 5MB or smaller." };
  }
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return { success: false, error: "Only PNG, JPEG, or WEBP images are allowed." };
  }

  await mkdir(COURSE_UPLOAD_DIR, { recursive: true });
  const filename = `cover-${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(COURSE_UPLOAD_DIR, filename), bytes);
  const publicPath = `/uploads/courses/${filename}`;

  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath("/landing-page");
  return { success: true, path: publicPath };
}

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
