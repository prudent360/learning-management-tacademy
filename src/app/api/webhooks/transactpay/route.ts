import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { activateMembership } from "@/app/actions/memberships";
import { ensureEnrollment } from "@/app/actions/enrollment";

/**
 * Transactpay webhook handler.
 * Verifies webhook signature, then on successful payment:
 *   1. Updates Payment status → "success"
 *   2. Creates Enrollment or activates MembershipSubscription
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature =
      req.headers.get("x-transactpay-signature") ||
      req.headers.get("x-webhook-signature") ||
      req.headers.get("signature") ||
      "";

    // Load gateway configuration
    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "transactpay" } });
    if (!gateway) {
      console.error("Transactpay webhook: gateway not found");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const secretKey =
      gateway.webhookSecret ||
      (gateway.mode === "live" ? gateway.liveSecretKey : gateway.testSecretKey);

    if (secretKey && signature) {
      // Verify HMAC sha512 or sha256 signature if signature header is provided
      const expectedSha512 = crypto
        .createHmac("sha512", secretKey)
        .update(body)
        .digest("hex");
      const expectedSha256 = crypto
        .createHmac("sha256", secretKey)
        .update(body)
        .digest("hex");

      if (signature !== expectedSha512 && signature !== expectedSha256) {
        console.error("Transactpay webhook: signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const event = payload.event || payload.eventType || "";
    const data = payload.data || payload;

    const reference = data?.reference || data?.tx_ref || data?.merchantReference;
    const status = (data?.status || payload.status || "").toLowerCase();

    if (!reference) {
      console.error("Transactpay webhook: no reference in payload");
      return NextResponse.json({ error: "No reference" }, { status: 400 });
    }

    // Find the pending payment — could be a course purchase or a membership subscription.
    const payment = await prisma.payment.findFirst({
      where: { providerRef: reference, status: "pending" },
    });
    const membershipSub = payment
      ? null
      : await prisma.membershipSubscription.findFirst({
          where: { providerRef: reference, status: "pending" },
        });

    if (!payment && !membershipSub) {
      console.warn("Transactpay webhook: no pending payment for ref", reference);
      return NextResponse.json({ status: "ignored" });
    }

    const succeeded =
      status === "success" ||
      status === "successful" ||
      status === "completed" ||
      event.endsWith(".successful") ||
      event.endsWith(".completed");

    if (payment) {
      if (succeeded) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "success" },
        });
        await ensureEnrollment(payment.userId, payment.courseSlug);
        console.log(
          `Transactpay webhook: enrolled user ${payment.userId} in course ${payment.courseSlug}`
        );
      } else if (status === "failed" || status === "declined" || status === "cancelled") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
      }
    } else if (membershipSub) {
      if (succeeded) {
        await activateMembership(membershipSub.id);
        console.log(`Transactpay webhook: activated membership for user ${membershipSub.userId}`);
      } else if (status === "failed" || status === "declined" || status === "cancelled") {
        await prisma.membershipSubscription.update({
          where: { id: membershipSub.id },
          data: { status: "failed" },
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Transactpay webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
