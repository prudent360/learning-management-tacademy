import "server-only";
import { prisma } from "@/lib/prisma";
import type { Course } from "./courses";
import type { PracticeExam } from "./aptitude-exams";

export async function getCourses(): Promise<Course[]> {
  try {
    const dbCourses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    return dbCourses.map((c) => ({
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      category: c.category,
      instructor: c.instructor,
      instructorUserId: c.instructorUserId,
      cover: c.cover,
      description: c.description,
      price: c.price,
      modules: c.modules.map((m) => ({
        id: m.moduleId,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          id: l.lessonId,
          dbId: l.id,
          title: l.title,
          type: l.type.toLowerCase() as any,
          duration: l.duration,
          content: JSON.parse(l.content),
          videoUrl: l.videoUrl || undefined,
          questions: l.questions.map((q) => ({
            id: q.questionId,
            prompt: q.prompt,
            options: JSON.parse(q.options),
            correctId: q.correctId,
            explanation: q.explanation,
          })),
        })),
      })),
    }));
  } catch (error) {
    console.error("Database query failed in getCourses:", error);
    return [];
  }
}

export async function getCourse(slug: string): Promise<Course | undefined> {
  try {
    const dbCourse = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!dbCourse) return undefined;

    return {
      slug: dbCourse.slug,
      title: dbCourse.title,
      subtitle: dbCourse.subtitle,
      category: dbCourse.category,
      instructor: dbCourse.instructor,
      instructorUserId: dbCourse.instructorUserId,
      cover: dbCourse.cover,
      description: dbCourse.description,
      price: dbCourse.price,
      modules: dbCourse.modules.map((m) => ({
        id: m.moduleId,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          id: l.lessonId,
          dbId: l.id,
          title: l.title,
          type: l.type.toLowerCase() as any,
          duration: l.duration,
          content: JSON.parse(l.content),
          videoUrl: l.videoUrl || undefined,
          questions: l.questions.map((q) => ({
            id: q.questionId,
            prompt: q.prompt,
            options: JSON.parse(q.options),
            correctId: q.correctId,
            explanation: q.explanation,
          })),
        })),
      })),
    };
  } catch (error) {
    console.error(`Database query failed in getCourse for slug ${slug}:`, error);
    return undefined;
  }
}

export async function getPracticeExams(): Promise<Record<string, PracticeExam>> {
  try {
    const dbExams = await prisma.practiceExam.findMany({
      include: {
        questions: true,
      },
    });

    const record: Record<string, PracticeExam> = {};
    for (const ex of dbExams) {
      record[ex.categorySlug] = {
        categorySlug: ex.categorySlug,
        categoryName: ex.categoryName,
        durationMinutes: ex.durationMinutes,
        questions: ex.questions.map((q) => ({
          id: q.questionId,
          prompt: q.prompt,
          options: JSON.parse(q.options),
          correctId: q.correctId,
          explanation: q.explanation,
        })),
      };
    }
    return record;
  } catch (error) {
    console.error("Database query failed in getPracticeExams:", error);
    return {};
  }
}

export async function getPracticeExam(categorySlug: string): Promise<PracticeExam | undefined> {
  try {
    const dbExam = await prisma.practiceExam.findUnique({
      where: { categorySlug },
      include: {
        questions: true,
      },
    });

    if (!dbExam) return undefined;

    return {
      categorySlug: dbExam.categorySlug,
      categoryName: dbExam.categoryName,
      durationMinutes: dbExam.durationMinutes,
      questions: dbExam.questions.map((q) => ({
        id: q.questionId,
        prompt: q.prompt,
        options: JSON.parse(q.options),
        correctId: q.correctId,
        explanation: q.explanation,
      })),
    };
  } catch (error) {
    console.error(`Database query failed in getPracticeExam for slug ${categorySlug}:`, error);
    return undefined;
  }
}
