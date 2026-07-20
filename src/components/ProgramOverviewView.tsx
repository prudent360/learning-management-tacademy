"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { lessonCount } from "@/lib/courses";
import type { Course } from "@/lib/courses";
import { useProgress } from "@/lib/useProgress";
import { CheckIcon, ArrowRightIcon } from "@/components/icons";

export function ProgramOverviewView({ courses }: { courses: Course[] }) {
  const aptitude = useProgress("aptitude-engine");
  const interview = useProgress("interview-formula");
  const personality = useProgress("personality-profiler");

  const bySlug: Record<string, ReturnType<typeof useProgress>> = {
    "aptitude-engine": aptitude,
    "interview-formula": interview,
    "personality-profiler": personality,
  };

  const rows = courses.map((c) => {
    const total = lessonCount(c);
    const { count, ready } = bySlug[c.slug];
    const pct = total ? Math.round((count / total) * 100) : 0;
    return { course: c, total, count, pct, ready };
  });

  const ready = rows.every((r) => r.ready);
  const totalLessons = rows.reduce((s, r) => s + r.total, 0);
  const doneLessons = rows.reduce((s, r) => s + r.count, 0);
  const overall = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
  const completed = rows.filter((r) => r.pct === 100).length;
  const inProgress = rows.filter((r) => r.pct > 0 && r.pct < 100).length;

  const milestones = [
    { label: "Enrolled", done: true },
    { label: "First course started", done: doneLessons > 0 },
    { label: "A course completed", done: completed > 0 },
    { label: "All courses completed", done: ready && completed === rows.length },
    { label: "Dream job secured", done: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Overview"
        subtitle="A bird's-eye view of your whole learning journey."
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center gap-5 rounded-2xl bg-surface p-6">
          <ProgressRing value={ready ? overall : 0} size={80} stroke={9} />
          <div>
            <p className="text-lg font-bold text-slate-800">Overall progress</p>
            <p className="text-sm text-muted">
              {ready ? `${doneLessons} of ${totalLessons} lessons complete` : "Loading…"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">Completed</p>
            <p className="mt-1 text-2xl font-bold text-brand-green">{ready ? completed : "—"}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">In progress</p>
            <p className="mt-1 text-2xl font-bold text-navy-600">{ready ? inProgress : "—"}</p>
          </div>
        </div>
      </div>

      {/* Course list */}
      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Your courses</h2>
        <div className="space-y-3">
          {rows.map(({ course, total, count, pct, ready: r }) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="flex items-center gap-4 rounded-xl border border-line p-4 transition-shadow hover:shadow-md"
            >
              <span className={`h-10 w-1.5 rounded-full bg-gradient-to-b ${course.cover}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-bold text-slate-800">{course.title}</p>
                  <span className="shrink-0 text-xs font-semibold text-navy-600">
                    {r ? `${pct}%` : ""}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-navy-600 transition-all"
                    style={{ width: `${r ? pct : 0}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {r ? `${count}/${total} lessons · ${course.category}` : course.category}
                </p>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Milestones</h2>
        <ol className="relative ml-3 space-y-5 border-l border-line">
          {milestones.map((m) => (
            <li key={m.label} className="ml-6">
              <span
                className={`absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full ${
                  m.done ? "bg-brand-green text-white" : "border-2 border-line bg-surface"
                }`}
              >
                {m.done && <CheckIcon className="h-3.5 w-3.5" />}
              </span>
              <p className={`text-sm ${m.done ? "font-semibold text-slate-800" : "text-muted"}`}>
                {m.label}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
