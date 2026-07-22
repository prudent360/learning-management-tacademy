"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";

export type EnrollmentSource = "free" | "paid" | "granted";

export type ListEnrollmentsFilters = {
  q?: string;
  courseSlug?: string;
  source?: EnrollmentSource;
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
  const admin = await requirePermission("enrollments:view");

  const { q, courseSlug, source: sourceFilter, sort = "newest" } = filters;

  // Instructors only see enrollments in courses assigned to them.
  const scopeToInstructor = admin.category === "INSTRUCTOR" ? admin.id : undefined;

  const where: Prisma.EnrollmentWhereInput = {
    ...(courseSlug ? { courseSlug } : {}),
    ...(scopeToInstructor ? { course: { instructorUserId: scopeToInstructor } } : {}),
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

  const rows = enrollments.map((e) => {
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

  // "source" is derived, not a DB column, so it's filtered in memory rather than in `where`.
  return sourceFilter ? rows.filter((r) => r.source === sourceFilter) : rows;
}

export async function listEnrollableCourses(): Promise<{ slug: string; title: string }[]> {
  const admin = await requirePermission("enrollments:view");
  return prisma.course.findMany({
    where: admin.category === "INSTRUCTOR" ? { instructorUserId: admin.id } : {},
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
}
