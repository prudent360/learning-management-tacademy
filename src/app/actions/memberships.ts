"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission, verifySession, getOptionalSession } from "@/lib/dal";
import { GATEWAY_IDS, type GatewayId } from "@/lib/payment-gateways";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

const SUBSCRIPTION_PERIOD_DAYS = 30;

// ---------- Admin: plan CRUD ----------

export type MembershipPlanRow = {
  id: string;
  name: string;
  price: number;
  discountPct: number;
  perks: string[];
  active: boolean;
  activeMemberCount: number;
};

export async function listMembershipPlansAdmin(): Promise<MembershipPlanRow[]> {
  await requirePermission("memberships:view");

  const [plans, activeSubs] = await Promise.all([
    prisma.membershipPlan.findMany({ orderBy: { price: "asc" } }),
    prisma.membershipSubscription.findMany({
      where: { status: "active", currentPeriodEnd: { gt: new Date() } },
      select: { planId: true },
    }),
  ]);

  const countByPlan = new Map<string, number>();
  for (const s of activeSubs) {
    countByPlan.set(s.planId, (countByPlan.get(s.planId) ?? 0) + 1);
  }

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPct: p.discountPct,
    perks: JSON.parse(p.perks || "[]"),
    active: p.active,
    activeMemberCount: countByPlan.get(p.id) ?? 0,
  }));
}

export type MembershipPlanInput = {
  name: string;
  price: number;
  discountPct: number;
  perks: string[];
  active: boolean;
};

function normalizePlanInput(input: MembershipPlanInput) {
  return {
    name: input.name.trim(),
    price: Math.max(0, Number(input.price) || 0),
    discountPct: Math.max(0, Math.min(100, Math.round(Number(input.discountPct) || 0))),
    perks: JSON.stringify(input.perks.map((p) => p.trim()).filter(Boolean)),
    active: input.active,
  };
}

export async function createMembershipPlanAction(input: MembershipPlanInput): Promise<ActionResult> {
  await requirePermission("memberships:create");
  if (!input.name.trim()) return { success: false, error: "Plan name is required." };

  await prisma.membershipPlan.create({ data: normalizePlanInput(input) });
  revalidatePath("/admin/memberships");
  return { success: true };
}

export async function updateMembershipPlanAction(
  id: string,
  input: MembershipPlanInput,
): Promise<ActionResult> {
  await requirePermission("memberships:edit");
  if (!input.name.trim()) return { success: false, error: "Plan name is required." };

  await prisma.membershipPlan.update({ where: { id }, data: normalizePlanInput(input) });
  revalidatePath("/admin/memberships");
  revalidatePath("/membership");
  return { success: true };
}

export async function toggleMembershipPlanActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await requirePermission("memberships:edit");
  await prisma.membershipPlan.update({ where: { id }, data: { active } });
  revalidatePath("/admin/memberships");
  revalidatePath("/membership");
  return { success: true };
}

export async function deleteMembershipPlanAction(id: string): Promise<ActionResult> {
  await requirePermission("memberships:delete");
  await prisma.membershipPlan.delete({ where: { id } });
  revalidatePath("/admin/memberships");
  revalidatePath("/membership");
  return { success: true };
}

// ---------- Admin: overview ----------

export type MembershipMemberRow = {
  id: string;
  userName: string;
  userEmail: string;
  planName: string;
  status: "pending" | "active" | "expired" | "failed";
  currentPeriodEnd: string | null;
};

export async function listMembershipMembersAdmin(): Promise<MembershipMemberRow[]> {
  await requirePermission("memberships:view");

  const subs = await prisma.membershipSubscription.findMany({
    include: {
      user: { select: { name: true, email: true } },
      plan: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  return subs.map((s) => {
    const isLapsed = s.status === "active" && s.currentPeriodEnd !== null && s.currentPeriodEnd < now;
    return {
      id: s.id,
      userName: s.user.name,
      userEmail: s.user.email,
      planName: s.plan.name,
      status: isLapsed ? "expired" : (s.status as MembershipMemberRow["status"]),
      currentPeriodEnd: s.currentPeriodEnd ? s.currentPeriodEnd.toISOString() : null,
    };
  });
}

export type MembershipStats = {
  activeMembers: number;
  pending: number;
  revenue: number;
  currency: string;
  planCount: number;
};

export async function getMembershipStatsAdmin(): Promise<MembershipStats> {
  await requirePermission("memberships:view");

  const now = new Date();
  const [subs, planCount] = await Promise.all([
    prisma.membershipSubscription.findMany(),
    prisma.membershipPlan.count(),
  ]);

  const active = subs.filter(
    (s) => s.status === "active" && s.currentPeriodEnd !== null && s.currentPeriodEnd > now,
  );
  const pending = subs.filter((s) => s.status === "pending");
  const revenue = active.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const currency = active[0]?.currency ?? pending[0]?.currency ?? "NGN";

  return { activeMembers: active.length, pending: pending.length, revenue, currency, planCount };
}

// ---------- Student-facing ----------

export type StudentPlan = {
  id: string;
  name: string;
  price: number;
  discountPct: number;
  perks: string[];
  isCurrent: boolean;
};

async function getMyActiveSubscription(userId: string) {
  return prisma.membershipSubscription.findFirst({
    where: { userId, status: "active", currentPeriodEnd: { gt: new Date() } },
    include: { plan: true },
  });
}

export async function listActiveMembershipPlans(): Promise<StudentPlan[]> {
  const session = await getOptionalSession();
  const [plans, mySub] = await Promise.all([
    prisma.membershipPlan.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    session ? getMyActiveSubscription(session.userId) : null,
  ]);

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPct: p.discountPct,
    perks: JSON.parse(p.perks || "[]"),
    isCurrent: mySub?.planId === p.id,
  }));
}

/** The discount % (0 if none) the current student's active membership grants on course purchases. */
export async function getMyMembershipDiscount(): Promise<number> {
  const session = await getOptionalSession();
  if (!session) return 0;
  const sub = await getMyActiveSubscription(session.userId);
  return sub?.plan.discountPct ?? 0;
}

// ---------- Student-facing: checkout ----------

type PaymentGatewayRow = NonNullable<Awaited<ReturnType<typeof prisma.paymentGateway.findUnique>>>;

function activeKeys(gateway: PaymentGatewayRow) {
  return gateway.mode === "live"
    ? { publicKey: gateway.livePublicKey, secretKey: gateway.liveSecretKey }
    : { publicKey: gateway.testPublicKey, secretKey: gateway.testSecretKey };
}

export type MembershipPaymentResult =
  | { success: true; paymentLink: string; reference: string }
  | { success: false; error: string };

export async function initMembershipPaymentAction(
  planId: string,
  gatewayId: GatewayId,
): Promise<MembershipPaymentResult> {
  const session = await verifySession();

  if (!GATEWAY_IDS.includes(gatewayId)) {
    return { success: false, error: "Unknown payment gateway" };
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) return { success: false, error: "Plan not found" };
  if (plan.price <= 0) return { success: false, error: "This plan has no charge" };

  const [gateway, orderSettings, user] = await Promise.all([
    prisma.paymentGateway.findUnique({ where: { id: gatewayId } }),
    prisma.paymentSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);
  if (!user) return { success: false, error: "User not found" };

  const { publicKey, secretKey } = gateway ? activeKeys(gateway) : { publicKey: "", secretKey: "" };
  if (!gateway || !gateway.enabled || !secretKey || (gatewayId === "fincra" && !publicKey)) {
    return { success: false, error: "That payment gateway isn't available" };
  }

  const reference = `TSU-MEM-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const currency = orderSettings.currency || "NGN";

  await prisma.membershipSubscription.upsert({
    where: { userId_planId: { userId: session.userId, planId } },
    update: {
      status: "pending",
      provider: gatewayId,
      providerRef: reference,
      amount: plan.price,
      currency,
    },
    create: {
      userId: session.userId,
      planId,
      status: "pending",
      provider: gatewayId,
      providerRef: reference,
      amount: plan.price,
      currency,
    },
  });

  if (gatewayId === "paystack") {
    const amountInSubunit = Math.round(plan.price * 100);
    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secretKey}` },
        body: JSON.stringify({
          email: user.email,
          amount: amountInSubunit,
          currency,
          reference,
          callback_url: `${appUrl}/membership?payment=success&reference=${reference}`,
          metadata: { type: "membership", planId, userId: session.userId },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.status || !data.data?.authorization_url) {
        console.error("Paystack membership init error:", data);
        return { success: false, error: data.message || "Failed to create payment link" };
      }
      return { success: true, paymentLink: data.data.authorization_url, reference };
    } catch (err) {
      console.error("Paystack membership init error:", err);
      return { success: false, error: "Payment service unavailable" };
    }
  }

  const apiBase = gateway.mode === "live" ? "https://api.fincra.com" : "https://sandboxapi.fincra.com";
  try {
    const res = await fetch(`${apiBase}/checkout/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": secretKey,
        "x-pub-key": publicKey,
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: plan.price,
        currency,
        customer: { name: user.name, email: user.email },
        reference,
        feeBearer: "customer",
        redirectUrl: `${appUrl}/membership?payment=success&reference=${reference}`.replace(
          "localhost",
          "127.0.0.1",
        ),
        metadata: { type: "membership", planId, userId: session.userId },
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.data?.link) {
      console.error("Fincra membership init error:", data);
      return { success: false, error: data.message || "Failed to create payment link" };
    }
    return { success: true, paymentLink: data.data.link, reference };
  } catch (err) {
    console.error("Fincra membership init error:", err);
    return { success: false, error: "Payment service unavailable" };
  }
}

export type VerifyMembershipResult = { active: boolean; failed?: boolean };

/** Mirrors verifyAndEnrollAction — polled from the membership confirmation screen after checkout redirect. */
export async function verifyMembershipAction(reference: string): Promise<VerifyMembershipResult> {
  const session = await verifySession();

  const sub = await prisma.membershipSubscription.findFirst({
    where: { userId: session.userId, providerRef: reference },
  });
  if (!sub) return { active: false };

  if (sub.status === "active") return { active: true };
  if (sub.status === "failed") return { active: false, failed: true };

  if (sub.provider === "paystack") {
    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "paystack" } });
    const candidateKeys = [gateway?.liveSecretKey, gateway?.testSecretKey].filter(
      (k): k is string => Boolean(k),
    );

    for (const secretKey of candidateKeys) {
      try {
        const res = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          { headers: { Authorization: `Bearer ${secretKey}` } },
        );
        const data = await res.json();
        if (res.ok && data.status && data.data?.status === "success") {
          await activateMembership(sub.id);
          return { active: true };
        }
        if (res.ok && data.status && data.data?.status === "failed") {
          await prisma.membershipSubscription.update({
            where: { id: sub.id },
            data: { status: "failed" },
          });
          return { active: false, failed: true };
        }
      } catch (err) {
        console.error("Paystack membership verify error:", err);
      }
    }
  }

  return { active: false };
}

export async function activateMembership(subscriptionId: string) {
  const currentPeriodEnd = new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  await prisma.membershipSubscription.update({
    where: { id: subscriptionId },
    data: { status: "active", currentPeriodEnd },
  });
}
