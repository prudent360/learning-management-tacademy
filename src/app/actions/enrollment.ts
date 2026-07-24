"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOptionalSession, verifySession } from "@/lib/dal";
import { GATEWAY_IDS, type GatewayId } from "@/lib/payment-gateways";
import { notify } from "@/lib/notify";
import { getMyMembershipDiscount } from "@/app/actions/memberships";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getAppUrl } from "@/lib/app-url";

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

/** Slugs of every course the current student has actually enrolled in (free or paid) — powers "My Courses". */
export async function getMyEnrolledCourseSlugs(): Promise<string[]> {
  const session = await getOptionalSession();
  if (!session) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId },
    select: { courseSlug: true },
  });

  return enrollments.map((e) => e.courseSlug);
}

// ---------- Free Enrollment ----------

export async function enrollFreeAction(
  courseSlug: string
): Promise<{ success: boolean; error?: string }> {
  const session = await verifySession();
  if (!session) return { success: false, error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { emailVerified: true } });
  if (!user) return { success: false, error: "User not found" };
  if (!user.emailVerified) {
    return { success: false, error: "Please verify your email address before enrolling in courses." };
  }

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return { success: false, error: "Course not found" };
  if (course.price > 0) return { success: false, error: "This course requires payment" };

  // Already enrolled?
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });
  if (existing) return { success: true };

  // Cohort-bearing programs go through Apply -> Admit instead of instant enroll.
  const cohortCount = await prisma.cohort.count({ where: { courseSlug } });
  let cohortId: string | null = null;
  if (cohortCount > 0) {
    const application = await prisma.application.findUnique({
      where: { userId_courseSlug: { userId: session.userId, courseSlug } },
      select: { status: true, cohortId: true },
    });
    if (application?.status !== "ADMITTED") {
      return { success: false, error: "This program requires an admitted application before enrolling." };
    }
    cohortId = application.cohortId;
  }

  await prisma.enrollment.create({
    data: { userId: session.userId, courseSlug, cohortId },
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
  if (!user.emailVerified) {
    return { success: false, error: "Please verify your email address before purchasing courses." };
  }

  const reference = `TSU-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const appUrl = await getAppUrl();
  const currency = orderSettings.currency || "NGN";

  // Apply the student's active membership discount (if any) to the real charge amount.
  const discountPct = await getMyMembershipDiscount();
  const price = Math.round(course.price * (1 - discountPct / 100) * 100) / 100;

  if (gatewayId === "paystack") {
    return initPaystackPayment({ secretKey, user, courseSlug, price, currency, reference, appUrl, userId: session.userId });
  }

  if (gatewayId === "transactpay") {
    return initTransactpayPayment({ gateway, secretKey, user, courseSlug, price, currency, reference, appUrl, userId: session.userId });
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
    // Bare URL — Fincra appends its own "?reference=..." on redirect
    // regardless of whether this URL already has query params, so adding
    // our own here would produce a malformed double query string.
    redirectUrl: `${appUrl}/courses/${courseSlug}`,
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
    // Bare URL — see the matching comment in initFincraPayment above.
    callback_url: `${appUrl}/courses/${courseSlug}`,
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

async function initTransactpayPayment({
  gateway,
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
  secretKey: string;
  user: PaymentUser;
  courseSlug: string;
  price: number;
  currency: string;
  reference: string;
  appUrl: string;
  userId: string;
}): Promise<PaymentInitResult> {
  const apiBase = gateway.mode === "live" ? "https://api.transactpay.ai" : "https://api-sandbox.transactpay.ai";

  const payload = {
    amount: price,
    currency,
    customer: {
      name: user.name,
      email: user.email,
    },
    reference,
    redirectUrl: `${appUrl}/courses/${courseSlug}`,
    metadata: {
      courseSlug,
      userId,
    },
  };

  try {
    const res = await fetch(`${apiBase}/v1/checkout/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
        "api-key": secretKey,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const link = data.data?.link || data.data?.authorization_url || data.link || data.authorization_url;

    if (!res.ok || !link) {
      console.error("Transactpay checkout error:", data);
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
        provider: "transactpay",
        providerRef: reference,
        status: "pending",
      },
    });

    return {
      success: true,
      paymentLink: link,
      reference,
    };
  } catch (err) {
    console.error("Transactpay API error:", err);
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

  if (payment.provider === "transactpay") {
    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "transactpay" } });
    if (gateway) {
      const apiBase = gateway.mode === "live" ? "https://api.transactpay.ai" : "https://api-sandbox.transactpay.ai";
      const candidateKeys = [gateway.liveSecretKey, gateway.testSecretKey].filter(Boolean);

      for (const secretKey of candidateKeys) {
        try {
          const res = await fetch(`${apiBase}/v1/checkout/verify/${encodeURIComponent(reference)}`, {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "api-key": secretKey,
              Accept: "application/json",
            },
          });
          const data = await res.json();
          const pStatus = data.data?.status || data.status;
          if (res.ok && (pStatus === "success" || pStatus === "successful" || pStatus === "completed")) {
            await prisma.payment.update({ where: { id: payment.id }, data: { status: "success" } });
            await ensureEnrollment(session.userId, courseSlug);
            return { enrolled: true };
          }
          if (res.ok && (pStatus === "failed" || pStatus === "declined" || pStatus === "cancelled" || pStatus === "expired")) {
            await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
            return { enrolled: false, failed: true };
          }
        } catch (err) {
          console.error("Transactpay verify error:", err);
        }
      }
    }
  }

  if (payment.provider === "fincra") {
    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "fincra" } });
    if (gateway) {
      const apiBase = gateway.mode === "live" ? "https://api.fincra.com" : "https://sandboxapi.fincra.com";
      const candidates = [
        { sec: gateway.liveSecretKey, pub: gateway.livePublicKey },
        { sec: gateway.testSecretKey, pub: gateway.testPublicKey },
      ].filter((c) => Boolean(c.sec));

      for (const { sec, pub } of candidates) {
        try {
          const res = await fetch(`${apiBase}/checkout/payments/merchant-reference/${encodeURIComponent(reference)}`, {
            headers: {
              "api-key": sec,
              "x-pub-key": pub,
              "x-business-id": gateway.businessId,
              Accept: "application/json",
            },
          });
          const data = await res.json();
          const pStatus = data.data?.status || data.status;
          if (res.ok && (pStatus === "success" || pStatus === "successful")) {
            await prisma.payment.update({ where: { id: payment.id }, data: { status: "success" } });
            await ensureEnrollment(session.userId, courseSlug);
            return { enrolled: true };
          }
          if (res.ok && (pStatus === "failed" || pStatus === "declined" || pStatus === "cancelled" || pStatus === "expired")) {
            await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
            return { enrolled: false, failed: true };
          }
        } catch (err) {
          console.error("Fincra verify error:", err);
        }
      }
    }
  }

  return { enrolled: false };
}

export async function ensureEnrollment(userId: string, courseSlug: string) {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId, courseSlug } },
  });

  if (!existing) {
    // Carry over the cohort from an admitted application, if this program uses one —
    // callers (payment webhooks, approvePayment, free-enroll) never need to know about this.
    const application = await prisma.application.findUnique({
      where: { userId_courseSlug: { userId, courseSlug } },
      select: { status: true, cohortId: true },
    });
    const cohortId = application?.status === "ADMITTED" ? application.cohortId : null;

    try {
      await prisma.enrollment.create({ data: { userId, courseSlug, cohortId } });
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
