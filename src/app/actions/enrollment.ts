"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOptionalSession, verifySession } from "@/lib/dal";
import { GATEWAY_IDS, type GatewayId } from "@/lib/payment-gateways";
import { notify } from "@/lib/notify";
import { getMyMembershipDiscount } from "@/app/actions/memberships";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ---------- Check Enrollment ----------

export async function checkEnrollment(
  courseSlug: string
): Promise<{ enrolled: boolean }> {
  const session = await getOptionalSession();
  if (!session) return { enrolled: false };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });

  return { enrolled: !!enrollment };
}

// ---------- Free Enrollment ----------

export async function enrollFreeAction(
  courseSlug: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession();
  if (!session) return { success: false, error: "Not authenticated" };

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return { success: false, error: "Course not found" };
  if (course.price > 0) return { success: false, error: "This course requires payment" };

  // Already enrolled?
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });
  if (existing) return { success: true };

  await prisma.enrollment.create({
    data: { userId: session.userId, courseSlug },
  });

  await notify(
    session.userId,
    "enrollment",
    `You're enrolled in ${course.title}!`,
    `/courses/${courseSlug}`,
  );

  revalidatePath(`/courses/${courseSlug}`);
  return { success: true };
}

// ---------- Initialize Payment ----------

export type PaymentInitResult =
  | { success: true; paymentLink: string; reference: string }
  | { success: false; error: string };

type PaymentGatewayRow = NonNullable<Awaited<ReturnType<typeof prisma.paymentGateway.findUnique>>>;
type PaymentUser = { name: string; email: string };

/** Active (mode-selected) key pair for a gateway. */
function activeKeys(gateway: PaymentGatewayRow) {
  return gateway.mode === "live"
    ? { publicKey: gateway.livePublicKey, secretKey: gateway.liveSecretKey }
    : { publicKey: gateway.testPublicKey, secretKey: gateway.testSecretKey };
}

export async function initPaymentAction(
  courseSlug: string,
  gatewayId: GatewayId
): Promise<PaymentInitResult> {
  const session = await verifySession();
  if (!session) return { success: false, error: "Not authenticated" };

  if (!GATEWAY_IDS.includes(gatewayId)) {
    return { success: false, error: "Unknown payment gateway" };
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });
  if (existing) return { success: false, error: "Already enrolled" };

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return { success: false, error: "Course not found" };
  if (course.price <= 0) return { success: false, error: "Course is free" };

  const [gateway, orderSettings] = await Promise.all([
    prisma.paymentGateway.findUnique({ where: { id: gatewayId } }),
    prisma.paymentSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
  ]);

  const { publicKey, secretKey } = gateway ? activeKeys(gateway) : { publicKey: "", secretKey: "" };
  // Fincra's API requires the public key as a header too; Paystack only needs the secret key.
  if (!gateway || !gateway.enabled || !secretKey || (gatewayId === "fincra" && !publicKey)) {
    return { success: false, error: "That payment gateway isn't available" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, error: "User not found" };

  const reference = `TSU-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const currency = orderSettings.currency || "NGN";

  // Apply the student's active membership discount (if any) to the real charge amount.
  const discountPct = await getMyMembershipDiscount();
  const price = Math.round(course.price * (1 - discountPct / 100) * 100) / 100;

  if (gatewayId === "paystack") {
    return initPaystackPayment({ secretKey, user, courseSlug, price, currency, reference, appUrl, userId: session.userId });
  }

  return initFincraPayment({ gateway, publicKey, secretKey, user, courseSlug, price, currency, reference, appUrl, userId: session.userId });
}

async function initFincraPayment({
  gateway,
  publicKey,
  secretKey,
  user,
  courseSlug,
  price,
  currency,
  reference,
  appUrl,
  userId,
}: {
  gateway: PaymentGatewayRow;
  publicKey: string;
  secretKey: string;
  user: PaymentUser;
  courseSlug: string;
  price: number;
  currency: string;
  reference: string;
  appUrl: string;
  userId: string;
}): Promise<PaymentInitResult> {
  const apiBase = gateway.mode === "live" ? "https://api.fincra.com" : "https://sandboxapi.fincra.com";

  const payload = {
    amount: price,
    currency,
    customer: {
      name: user.name,
      email: user.email,
    },
    reference,
    feeBearer: "customer",
    redirectUrl: `${appUrl}/courses/${courseSlug}?payment=success&reference=${reference}`.replace("localhost", "127.0.0.1"),
    metadata: {
      courseSlug,
      userId,
    },
  };

  try {
    const res = await fetch(`${apiBase}/checkout/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": secretKey,
        "x-pub-key": publicKey,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.data?.link) {
      console.error("Fincra checkout error:", data);
      return {
        success: false,
        error: data.message || "Failed to create payment link",
      };
    }

    await prisma.payment.create({
      data: {
        userId,
        courseSlug,
        amount: price,
        currency,
        provider: "fincra",
        providerRef: reference,
        status: "pending",
      },
    });

    return {
      success: true,
      paymentLink: data.data.link,
      reference,
    };
  } catch (err) {
    console.error("Fincra API error:", err);
    return { success: false, error: "Payment service unavailable" };
  }
}

async function initPaystackPayment({
  secretKey,
  user,
  courseSlug,
  price,
  currency,
  reference,
  appUrl,
  userId,
}: {
  secretKey: string;
  user: PaymentUser;
  courseSlug: string;
  price: number;
  currency: string;
  reference: string;
  appUrl: string;
  userId: string;
}): Promise<PaymentInitResult> {
  // Paystack takes amounts in the smallest currency unit (kobo/pesewas/cents), not the display unit.
  const amountInSubunit = Math.round(price * 100);

  const payload = {
    email: user.email,
    amount: amountInSubunit,
    currency,
    reference,
    callback_url: `${appUrl}/courses/${courseSlug}?payment=success&reference=${reference}`,
    metadata: {
      courseSlug,
      userId,
    },
  };

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.status || !data.data?.authorization_url) {
      console.error("Paystack checkout error:", data);
      return {
        success: false,
        error: data.message || "Failed to create payment link",
      };
    }

    await prisma.payment.create({
      data: {
        userId,
        courseSlug,
        amount: price,
        currency,
        provider: "paystack",
        providerRef: reference,
        status: "pending",
      },
    });

    return {
      success: true,
      paymentLink: data.data.authorization_url,
      reference,
    };
  } catch (err) {
    console.error("Paystack API error:", err);
    return { success: false, error: "Payment service unavailable" };
  }
}

// ---------- Verify Payment (called when the user lands back from checkout) ----------

export type VerifyPaymentResult = { enrolled: boolean; failed?: boolean };

/**
 * Called from the course page when the user returns from a hosted checkout
 * page. The webhook is the authoritative path for confirming payment, but it
 * fires asynchronously and can lag behind the redirect — this lets us also
 * actively check status (and, for Paystack, verify directly) so the user
 * isn't dumped back on the checkout card while the webhook is still in transit.
 */
export async function verifyAndEnrollAction(
  courseSlug: string,
  reference: string
): Promise<VerifyPaymentResult> {
  const session = await verifySession();
  if (!session) return { enrolled: false };

  const payment = await prisma.payment.findFirst({
    where: { providerRef: reference, userId: session.userId, courseSlug },
  });
  if (!payment) return { enrolled: false };

  if (payment.status === "success") {
    await ensureEnrollment(session.userId, courseSlug);
    return { enrolled: true };
  }

  if (payment.status === "failed") {
    return { enrolled: false, failed: true };
  }

  // Still pending — for Paystack we can verify directly instead of only
  // waiting on the webhook, since its verify-transaction endpoint is a
  // simple authenticated GET keyed by the same reference. The payment may
  // have been started under either mode, so try whichever secret keys are
  // configured rather than assuming the gateway's *current* mode.
  if (payment.provider === "paystack") {
    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "paystack" } });
    const candidateKeys = [gateway?.liveSecretKey, gateway?.testSecretKey].filter(
      (k): k is string => Boolean(k)
    );

    for (const secretKey of candidateKeys) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${secretKey}` },
        });
        const data = await res.json();
        if (res.ok && data.status && data.data?.status === "success") {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: "success" } });
          await ensureEnrollment(session.userId, courseSlug);
          return { enrolled: true };
        }
        if (res.ok && data.status && data.data?.status === "failed") {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
          return { enrolled: false, failed: true };
        }
      } catch (err) {
        console.error("Paystack verify error:", err);
      }
    }
  }

  return { enrolled: false };
}

async function ensureEnrollment(userId: string, courseSlug: string) {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId, courseSlug } },
  });

  if (!existing) {
    try {
      await prisma.enrollment.create({ data: { userId, courseSlug } });
      const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
      if (course) {
        await notify(
          userId,
          "enrollment",
          `You're enrolled in ${course.title}!`,
          `/courses/${courseSlug}`,
        );
      }
    } catch (err) {
      // Another concurrent call already created it — safe to ignore.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
        throw err;
      }
    }
  }

  revalidatePath(`/courses/${courseSlug}`);
}
