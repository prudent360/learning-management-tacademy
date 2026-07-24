"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAttendanceAction, type AttendanceStatus, type RosterEntry } from "@/app/actions/attendance";
import { Avatar } from "@/components/Avatar";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; activeClass: string }[] = [
  { value: "PRESENT", label: "Present", activeClass: "bg-brand-green text-white" },
  { value: "LATE", label: "Late", activeClass: "bg-amber-500 text-white" },
  { value: "ABSENT", label: "Absent", activeClass: "bg-red-500 text-white" },
];

export function AttendanceRoster({
  cohortId,
  date,
  roster,
  markedDates,
}: {
  cohortId: string;
  date: string;
  roster: RosterEntry[];
  markedDates: string[];
}) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus | null>>(() =>
    Object.fromEntries(roster.map((r) => [r.userId, r.status])),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const markedCount = useMemo(
    () => Object.values(statuses).filter(Boolean).length,
    [statuses],
  );

  const setStatus = (userId: string, status: AttendanceStatus) => {
    setSaved(false);
    setStatuses((prev) => ({ ...prev, [userId]: status }));
  };

  const markAllPresent = () => {
    setSaved(false);
    setStatuses(Object.fromEntries(roster.map((r) => [r.userId, "PRESENT" as AttendanceStatus])));
  };

  const handleSave = () => {
    setError(null);
    const records = Object.entries(statuses)
      .filter((entry): entry is [string, AttendanceStatus] => entry[1] !== null)
      .map(([userId, status]) => ({ userId, status }));

    startTransition(async () => {
      const result = await markAttendanceAction(cohortId, date, records);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Session date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => router.push(`?date=${e.target.value}`)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
          />
        </div>
        {markedDates.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted">Previously marked:</span>
            {markedDates.slice(0, 6).map((d) => (
              <button
                key={d}
                onClick={() => router.push(`?date=${d}`)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  d === date ? "bg-navy text-white" : "bg-surface-muted text-slate-600 hover:bg-slate-100"
                }`}
              >
                {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">
            {markedCount}/{roster.length} marked
          </p>
          <button
            onClick={markAllPresent}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Mark all present
          </button>
        </div>

        <div className="space-y-2">
          {roster.map((r) => (
            <div
              key={r.userId}
              className="flex flex-col gap-3 rounded-xl bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={r.userName} accent="navy" size={32} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{r.userName}</p>
                  <p className="truncate text-xs text-muted">{r.userEmail}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const active = statuses[r.userId] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(r.userId, opt.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active ? opt.activeClass : "bg-surface text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {roster.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No students enrolled in this cohort yet.</p>
          )}
        </div>

        {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}

        {roster.length > 0 && (
          <div className="mt-4 flex items-center justify-end gap-3">
            {saved && <span className="text-xs font-semibold text-brand-green">Saved ✓</span>}
            <button
              onClick={handleSave}
              disabled={pending}
              className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
