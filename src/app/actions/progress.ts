"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function getProgress(courseSlug: string): Promise<string[]> {
  const { userId } = await verifySession();
  const rows = await prisma.lessonCompletion.findMany({
    where: { userId, courseSlug },
    select: { lessonId: true },
  });
  return rows.map((r) => r.lessonId);
}

export async function setLessonComplete(
  courseSlug: string,
  lessonId: string,
  value: boolean,
): Promise<void> {
  const { userId } = await verifySession();

  if (value) {
    await prisma.lessonCompletion.upsert({
      where: { userId_courseSlug_lessonId: { userId, courseSlug, lessonId } },
      create: { userId, courseSlug, lessonId },
      update: {},
    });
  } else {
    await prisma.lessonCompletion.deleteMany({
      where: { userId, courseSlug, lessonId },
    });
  }
}
