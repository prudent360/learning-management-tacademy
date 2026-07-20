"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type ListPaymentsFilters = {
  q?: string;
  status?: PaymentStatus;
  sort?: "newest" | "oldest" | "amount";
};

export type PaymentRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseSlug: string;
  courseTitle: string;
  amount: number;
  currency: string;
  provider: string;
  providerRef: string;
  status: string;
  createdAt: Date;
};

export async function listPayments(filters: ListPaymentsFilters = {}): Promise<PaymentRow[]> {
  await requireAdmin();

  const { q, status, sort = "newest" } = filters;

  const where: Prisma.PaymentWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { providerRef: { contains: q } },
            { courseSlug: { contains: q } },
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.PaymentOrderByWithRelationInput =
    sort === "oldest" ? { createdAt: "asc" } : sort === "amount" ? { amount: "desc" } : { createdAt: "desc" };

  const [payments, courses] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.course.findMany({ select: { slug: true, title: true } }),
  ]);

  const courseTitles = new Map(courses.map((c) => [c.slug, c.title]));

  return payments.map((p) => ({
    id: p.id,
    userId: p.userId,
    userName: p.user.name,
    userEmail: p.user.email,
    courseSlug: p.courseSlug,
    courseTitle: courseTitles.get(p.courseSlug) ?? p.courseSlug,
    amount: p.amount,
    currency: p.currency,
    provider: p.provider,
    providerRef: p.providerRef,
    status: p.status,
    createdAt: p.createdAt,
  }));
}

export type PaymentStats = {
  revenueByCurrency: { currency: string; total: number }[];
  counts: Record<PaymentStatus, number>;
};

export async function getPaymentStats(): Promise<PaymentStats> {
  await requireAdmin();

  const [revenue, statusCounts] = await Promise.all([
    prisma.payment.groupBy({
      by: ["currency"],
      where: { status: "success" },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const counts: Record<PaymentStatus, number> = { pending: 0, success: 0, failed: 0, refunded: 0 };
  for (const row of statusCounts) {
    if (row.status in counts) counts[row.status as PaymentStatus] = row._count.status;
  }

  return {
    revenueByCurrency: revenue.map((r) => ({ currency: r.currency, total: r._sum.amount ?? 0 })),
    counts,
  };
}

type AdminActionResult = { success: true } | { success: false; error: string };

/** Marks a successful payment as refunded and revokes the associated course access. */
export async function markPaymentRefunded(paymentId: string): Promise<AdminActionResult> {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { success: false, error: "Payment not found." };
  if (payment.status !== "success") {
    return { success: false, error: "Only successful payments can be refunded." };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: paymentId }, data: { status: "refunded" } }),
    prisma.enrollment.deleteMany({
      where: { userId: payment.userId, courseSlug: payment.courseSlug },
    }),
  ]);

  revalidatePath("/admin/payments");
  return { success: true };
}
