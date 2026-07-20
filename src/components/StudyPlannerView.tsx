"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { TargetIcon, CheckIcon, ClockIcon } from "@/components/icons";
import { setGoalTargetDate, clearGoal, type StudyPlanItem } from "@/app/actions/goals";

const STATUS_LABEL: Record<StudyPlanItem["status"], string> = {
  completed: "Completed",
  "on-track": "On track",
  behind: "Behind schedule",
  "no-goal": "No goal set",
};

const STATUS_STYLE: Record<StudyPlanItem["status"], string> = {
  completed: "bg-green-50 text-brand-green border-green-100",
  "on-track": "bg-navy-50 text-navy border-navy-50",
  behind: "bg-orange-50 text-orange-600 border-orange-100",
  "no-goal": "bg-slate-50 text-slate-500 border-line",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function GoalCard({ item }: { item: StudyPlanItem }) {
  const [targetDate, setTargetDate] = useState(item.targetDate?.slice(0, 10) ?? "");
  const [saved, setSaved] = useState(item);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!targetDate) return;
    setError(null);
    startTransition(async () => {
      const result = await setGoalTargetDate(item.courseSlug, targetDate);
      if (!result.success) {
        setError(result.error ?? "Failed to save goal");
        return;
      }
      const target = new Date(targetDate);
      const daysRemaining = Math.ceil((target.getTime() - Date.now()) / 86_400_000);
      setSaved((prev) => ({
        ...prev,
        targetDate: target.toISOString(),
        daysRemaining,
        status:
          prev.progressPct >= 100
            ? "completed"
            : daysRemaining < 0
              ? "behind"
              : "on-track",
      }));
    });
  };

  const handleClear = () => {
    setError(null);
    startTransition(async () => {
      await clearGoal(item.courseSlug);
      setTargetDate("");
      setSaved((prev) => ({ ...prev, targetDate: null, daysRemaining: null, status: "no-goal" }));
    });
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProgressRing value={saved.progressPct} color="var(--navy)" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">{saved.courseTitle}</h3>
            <p className="text-xs text-muted">
              {saved.completedLessons} of {saved.totalLessons} lessons complete
            </p>
            <span
              className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[saved.status]}`}
            >
              {saved.status === "completed" && <CheckIcon className="h-3 w-3" />}
              {saved.status === "behind" && <ClockIcon className="h-3 w-3" />}
              {STATUS_LABEL[saved.status]}
              {saved.daysRemaining !== null && saved.status !== "completed" && (
                <span>
                  {" "}
                  · {saved.daysRemaining >= 0 ? `${saved.daysRemaining}d left` : `${-saved.daysRemaining}d overdue`}
                </span>
              )}
            </span>
          </div>
        </div>

        {saved.status !== "completed" && (
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600" htmlFor={`target-${saved.courseSlug}`}>
                Target date
              </label>
              <input
                id={`target-${saved.courseSlug}`}
                type="date"
                min={todayIso()}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="rounded-lg border border-line bg-surface-muted px-3 py-1.5 text-sm outline-none focus:border-navy-600"
              />
            </div>
            <div className="flex items-center gap-2">
              {saved.targetDate && (
                <button
                  onClick={handleClear}
                  disabled={isPending}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Clear goal
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isPending || !targetDate}
                className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
              >
                {saved.targetDate ? "Update goal" : "Set goal"}
              </button>
            </div>
            {error && <p className="text-[11px] text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function StudyPlannerView({ items }: { items: StudyPlanItem[] }) {
  const onTrack = items.filter((i) => i.status === "on-track").length;
  const behind = items.filter((i) => i.status === "behind").length;
  const completed = items.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-navy px-6 py-3.5">
        <h1 className="flex items-center gap-2 text-base font-bold text-white">
          <TargetIcon className="h-5 w-5" />
          Study Planner
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No enrolled courses yet</p>
          <p className="mt-1 text-xs text-muted">
            Enroll in a course to set a target completion date and track your progress here.
          </p>
          <Link
            href="/my-courses"
            className="mt-4 inline-block rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-700"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">Enrolled</p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">{items.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">On track</p>
              <p className="mt-1 text-xl font-extrabold text-navy">{onTrack}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">Behind schedule</p>
              <p className="mt-1 text-xl font-extrabold text-orange-600">{behind}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">Completed</p>
              <p className="mt-1 text-xl font-extrabold text-brand-green">{completed}</p>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <GoalCard key={item.courseSlug} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
