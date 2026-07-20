import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { activateMembership } from "@/app/actions/memberships";

/**
 * Fincra webhook handler.
 * Verifies signature, then on successful payment:
 *   1. Updates Payment status → "success"
 *   2. Creates Enrollment record
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("signature") || req.headers.get("x-webhook-signature") || "";

    // Load webhook secret
    const gateway = await prisma.paymentGateway.findUnique({ where: { id: "fincra" } });
    if (!gateway || !gateway.webhookSecret) {
      console.error("Fincra webhook: no webhook secret configured");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac("sha512", gateway.webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSig) {
      console.error("Fincra webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.data;

    if (event === "charge.completed" || event === "collection.successful") {
      const reference = data?.reference || data?.merchantReference;
      const status = data?.status;

      if (!reference) {
        console.error("Fincra webhook: no reference in payload");
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
        console.warn("Fincra webhook: no pending payment for ref", reference);
        return NextResponse.json({ status: "ignored" });
      }

      const succeeded = status === "success" || status === "successful";

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
            `Fincra webhook: enrolled user ${payment.userId} in course ${payment.courseSlug}`
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
          console.log(`Fincra webhook: activated membership for user ${membershipSub.userId}`);
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
    console.error("Fincra webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
