"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
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
  await requirePermission("payments:view");

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
  await requirePermission("payments:view");

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
  await requirePermission("payments:edit");

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

/**
 * Manually approves a pending payment (e.g. a bank transfer reconciled by
 * hand, or a webhook that never arrived) — mirrors exactly what the Fincra
 * and Paystack webhooks do on a successful charge: mark it "success" and
 * grant course access.
 */
export async function approvePayment(paymentId: string): Promise<AdminActionResult> {
  await requirePermission("payments:edit");

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { success: false, error: "Payment not found." };
  if (payment.status !== "pending") {
    return { success: false, error: "Only pending payments can be approved." };
  }

  await prisma.$transaction([
    prisma.payment.update({ where: { id: paymentId }, data: { status: "success" } }),
    prisma.enrollment.upsert({
      where: { userId_courseSlug: { userId: payment.userId, courseSlug: payment.courseSlug } },
      create: { userId: payment.userId, courseSlug: payment.courseSlug },
      update: {},
    }),
  ]);

  revalidatePath("/admin/payments");
  return { success: true };
}

/** Manually rejects a pending payment — no course access is ever granted. */
export async function rejectPayment(paymentId: string): Promise<AdminActionResult> {
  await requirePermission("payments:edit");

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { success: false, error: "Payment not found." };
  if (payment.status !== "pending") {
    return { success: false, error: "Only pending payments can be rejected." };
  }

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "failed" } });

  revalidatePath("/admin/payments");
  return { success: true };
}

export type EditPaymentInput = {
  amount: number;
  currency: string;
  providerRef: string;
};

/** Corrects the record itself (e.g. a manual-entry typo) — never changes status or enrollment. */
export async function updatePaymentDetails(
  paymentId: string,
  input: EditPaymentInput,
): Promise<AdminActionResult> {
  await requirePermission("payments:edit");

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { success: false, error: "Amount must be a positive number." };
  }
  const currency = input.currency.trim().toUpperCase();
  if (currency.length !== 3) {
    return { success: false, error: "Currency must be a 3-letter code." };
  }
  const providerRef = input.providerRef.trim();
  if (!providerRef) {
    return { success: false, error: "Provider reference is required." };
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { success: false, error: "Payment not found." };

  await prisma.payment.update({
    where: { id: paymentId },
    data: { amount: input.amount, currency, providerRef },
  });

  revalidatePath("/admin/payments");
  return { success: true };
}
