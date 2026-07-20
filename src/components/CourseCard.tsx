"use client";

import Link from "next/link";
import type { Course } from "@/lib/courses";
import { lessonCount, courseMinutes } from "@/lib/courses";
import { useProgress } from "@/lib/useProgress";
import { formatCurrency, convertDisplayPrice } from "@/lib/currency";
import { ClockIcon, BookIcon } from "@/components/icons";

function formatPrice(amount: number, currency?: string) {
  return formatCurrency(amount, currency || "NGN");
}

export function CourseCard({
  course,
  currency,
  displayCurrency,
  displayRate,
}: {
  course: Course;
  currency?: string;
  /** Student's local currency, from their profile country — display-only estimate, never the real charge currency. */
  displayCurrency?: string | null;
  displayRate?: number | null;
}) {
  const total = lessonCount(course);
  const { count, ready } = useProgress(course.slug);
  const pct = total ? Math.round((count / total) * 100) : 0;
  const started = count > 0;
  const isFree = course.price <= 0;

  const converted = convertDisplayPrice(
    course.price,
    currency || "NGN",
    displayCurrency,
    displayRate,
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md">
      <div className={`relative h-28 bg-gradient-to-br ${course.cover} p-4`}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {course.category}
          </span>
          {!started && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${
                isFree
                  ? "bg-green-500/20 text-green-100"
                  : "bg-orange/20 text-orange-100"
              }`}
            >
              {isFree ? "Free" : formatPrice(course.price, currency)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-800">{course.title}</h3>
        <p className="mt-1 text-sm text-muted">{course.subtitle}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <BookIcon className="h-4 w-4" />
            {total} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" />
            {courseMinutes(course)} min
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">
              {ready ? `${count}/${total} complete` : " "}
            </span>
            <span className="font-semibold text-navy-600">
              {ready ? `${pct}%` : ""}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-navy-600 transition-all"
              style={{ width: `${ready ? pct : 0}%` }}
            />
          </div>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className={`mt-5 rounded-lg py-2.5 text-center text-sm font-semibold text-white transition-colors ${
            !started && !isFree
              ? "bg-orange hover:bg-orange/90"
              : "bg-navy hover:bg-navy-700"
          }`}
        >
          {pct === 100
            ? "Review course"
            : started
              ? "Continue"
              : isFree
                ? "Start course"
                : `Enroll — ${formatPrice(course.price, currency)}`}
        </Link>
        {!started && !isFree && converted !== null && displayCurrency && (
          <p className="mt-1.5 text-center text-[11px] text-muted">
            ≈ {formatPrice(converted, displayCurrency)}
          </p>
        )}
      </div>
    </div>
  );
}
