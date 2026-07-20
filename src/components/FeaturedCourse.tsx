"use client";

import Link from "next/link";
import type { Course } from "@/lib/courses";
import { lessonCount, courseMinutes } from "@/lib/courses";
import { useProgress } from "@/lib/useProgress";
import { ClockIcon, BookIcon, ArrowRightIcon } from "@/components/icons";

export function FeaturedCourse({ course }: { course: Course }) {
  const slug = course.slug;
  const total = lessonCount(course);
  const { count, ready } = useProgress(slug);

  if (!course) return null;

  const pct = total ? Math.round((count / total) * 100) : 0;
  const label = pct === 100 ? "Review course" : count > 0 ? "Continue" : "Start course";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className={`h-2 bg-gradient-to-r ${course.cover}`} />
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:p-6">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-orange">
            Featured course
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-800">{course.title}</h3>
          <p className="mt-1 text-sm text-muted">{course.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <BookIcon className="h-4 w-4" />
              {total} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              {courseMinutes(course)} min
            </span>
            <span>Coach: {course.instructor}</span>
          </div>

          <div className="mt-4 max-w-md">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted">{ready ? `${count}/${total} complete` : " "}</span>
              <span className="font-semibold text-navy-600">{ready ? `${pct}%` : ""}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-navy-600 transition-all"
                style={{ width: `${ready ? pct : 0}%` }}
              />
            </div>
          </div>
        </div>

        <Link
          href={`/courses/${slug}`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
        >
          {label}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
