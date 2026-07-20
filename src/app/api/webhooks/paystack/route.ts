import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { activateMembership } from "@/app/actions/memberships";

/**
 * Paystack webhook handler.
 * Verifies signature, then on successful charge:
 *   1. Updates Payment status → "success"
 *   2. Creates Enrollment record
 *
 * Paystack signs webhooks with the account's Secret Key (not a separate
 * webhook secret) — HMAC-SHA512 of the raw body, hex-encoded, sent in the
 * `x-paystack-signature` header.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "paystack" } });
    const candidateKeys = [gateway?.liveSecretKey, gateway?.testSecretKey].filter(
      (k): k is string => Boolean(k)
    );
    if (candidateKeys.length === 0) {
      console.error("Paystack webhook: no secret key configured");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // The transaction may have been created under either mode, so accept a
    // signature that matches either configured secret key.
    const isValidSignature = candidateKeys.some(
      (key) => crypto.createHmac("sha512", key).update(body).digest("hex") === signature
    );

    if (!isValidSignature) {
      console.error("Paystack webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.data;

    if (event === "charge.success") {
      const reference = data?.reference;

      if (!reference) {
        console.error("Paystack webhook: no reference in payload");
        return NextResponse.json({ error: "No reference" }, { status: 400 });
      }

      const payment = await prisma.payment.findFirst({
        where: { providerRef: reference, status: "pending" },
      });
      const membershipSub = payment
        ? null
        : await prisma.membershipSubscription.findFirst({
            where: { providerRef: reference, status: "pending" },
          });

      if (!payment && !membershipSub) {
        console.warn("Paystack webhook: no pending payment for ref", reference);
        return NextResponse.json({ status: "ignored" });
      }

      const succeeded = data.status === "success";

      if (payment) {
        if (succeeded) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "success" },
          });
          await prisma.enrollment.upsert({
            where: {
              userId_courseSlug: {
                userId: payment.userId,
                courseSlug: payment.courseSlug,
              },
            },
            create: {
              userId: payment.userId,
              courseSlug: payment.courseSlug,
            },
            update: {},
          });
          console.log(
            `Paystack webhook: enrolled user ${payment.userId} in course ${payment.courseSlug}`
          );
        } else {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" },
          });
        }
      } else if (membershipSub) {
        if (succeeded) {
          await activateMembership(membershipSub.id);
          console.log(`Paystack webhook: activated membership for user ${membershipSub.userId}`);
        } else {
          await prisma.membershipSubscription.update({
            where: { id: membershipSub.id },
            data: { status: "failed" },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
