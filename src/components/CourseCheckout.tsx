"use client";

import { useState, useTransition } from "react";
import { initPaymentAction, enrollFreeAction } from "@/app/actions/enrollment";
import type { GatewayId, CheckoutGateway } from "@/app/actions/settings";
import type { Course } from "@/lib/courses";
import { lessonCount, courseMinutes } from "@/lib/courses";
import { formatCurrency } from "@/lib/currency";
import {
  BookIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@/components/icons";

export function CourseCheckout({
  course,
  currency,
  gateways,
}: {
  course: Course;
  currency: string;
  gateways: CheckoutGateway[];
}) {
  const [pendingGateway, setPendingGateway] = useState<GatewayId | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isFree = course.price <= 0;

  const formatPrice = (amount: number) => formatCurrency(amount, currency);

  const handleFreeEnroll = () => {
    setError(null);
    startTransition(async () => {
      const res = await enrollFreeAction(course.slug);
      if (!res.success) {
        setError(res.error || "Failed to enroll");
        return;
      }
      window.location.reload();
    });
  };

  const handlePay = (gatewayId: GatewayId) => {
    setError(null);
    setPendingGateway(gatewayId);
    startTransition(async () => {
      const res = await initPaymentAction(course.slug, gatewayId);
      if (!res.success) {
        setError(res.error);
        setPendingGateway(null);
        return;
      }
      // Redirect to the chosen gateway's hosted checkout page
      window.location.href = res.paymentLink;
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Course preview card */}
        <div className="rounded-xl border border-line bg-surface overflow-hidden">
          {/* Gradient header */}
          <div
            className={`relative h-36 bg-gradient-to-br ${course.cover} p-6 flex flex-col justify-end`}
          >
            <span className="inline-block self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur mb-2">
              {course.category}
            </span>
            <h1 className="text-xl font-bold text-white leading-tight">
              {course.title}
            </h1>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-sm text-muted leading-relaxed">
              {course.description}
            </p>

            {/* Course meta */}
            <div className="flex items-center gap-5 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <BookIcon className="h-4 w-4" />
                {lessonCount(course)} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" />
                {courseMinutes(course)} minutes
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                by {course.instructor}
              </span>
            </div>

            {/* Module breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                What you&apos;ll learn
              </h3>
              <div className="space-y-1.5">
                {course.modules.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 text-sm text-slate-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 text-brand-green shrink-0" />
                    <span>
                      {m.title}{" "}
                      <span className="text-muted text-xs">
                        ({m.lessons.length} lessons)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="border-t border-line pt-5 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isFree ? "Free Course" : "Course Price"}
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {isFree ? "Free" : formatPrice(course.price)}
                </p>
              </div>

              {isFree ? (
                <button
                  onClick={handleFreeEnroll}
                  disabled={pending}
                  className="w-full rounded-lg bg-brand-green py-3 text-sm font-bold text-white transition-all hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Processing…" : "Enroll for Free →"}
                </button>
              ) : gateways.length === 0 ? (
                <p className="rounded-lg bg-surface-muted py-3 text-center text-sm text-muted">
                  Payment isn&apos;t currently available for this course. Please check back soon.
                </p>
              ) : (
                <div className="space-y-2">
                  {gateways.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handlePay(g.id)}
                      disabled={pending}
                      className="w-full rounded-lg bg-orange py-3 text-sm font-bold text-white transition-all hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pending && pendingGateway === g.id
                        ? "Processing…"
                        : `Pay ${formatPrice(course.price)} with ${g.label} →`}
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
              )}

              <p className="text-[10px] text-muted text-center leading-relaxed">
                {isFree
                  ? "Start learning immediately after enrollment."
                  : "You'll be redirected to a secure payment page. After payment, you'll have lifetime access to this course."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
