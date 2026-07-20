"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export type EnrollmentSource = "free" | "paid" | "granted";

export type ListEnrollmentsFilters = {
  q?: string;
  courseSlug?: string;
  sort?: "newest" | "oldest";
};

export type EnrollmentRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseSlug: string;
  courseTitle: string;
  coursePrice: number;
  source: EnrollmentSource;
  paymentProvider?: string;
  enrolledAt: Date;
};

export async function listEnrollments(filters: ListEnrollmentsFilters = {}): Promise<EnrollmentRow[]> {
  await requireAdmin();

  const { q, courseSlug, sort = "newest" } = filters;

  const where: Prisma.EnrollmentWhereInput = {
    ...(courseSlug ? { courseSlug } : {}),
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
            { course: { title: { contains: q } } },
          ],
        }
      : {}),
  };

  const [enrollments, successfulPayments] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true, price: true } },
      },
      orderBy: { enrolledAt: sort === "oldest" ? "asc" : "desc" },
    }),
    prisma.payment.findMany({
      where: { status: "success" },
      select: { userId: true, courseSlug: true, provider: true },
    }),
  ]);

  const paymentByKey = new Map(
    successfulPayments.map((p) => [`${p.userId}:${p.courseSlug}`, p.provider])
  );

  return enrollments.map((e) => {
    const paidVia = paymentByKey.get(`${e.userId}:${e.courseSlug}`);
    const source: EnrollmentSource = e.course.price <= 0 ? "free" : paidVia ? "paid" : "granted";

    return {
      id: e.id,
      userId: e.userId,
      userName: e.user.name,
      userEmail: e.user.email,
      courseSlug: e.courseSlug,
      courseTitle: e.course.title,
      coursePrice: e.course.price,
      source,
      paymentProvider: paidVia,
      enrolledAt: e.enrolledAt,
    };
  });
}

export async function listEnrollableCourses(): Promise<{ slug: string; title: string }[]> {
  await requireAdmin();
  return prisma.course.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } });
}
