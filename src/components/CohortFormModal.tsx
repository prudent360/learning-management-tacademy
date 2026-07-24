"use client";

import { useState, useTransition } from "react";
import {
  createCohortAction,
  updateCohortAction,
  setCohortStatusAction,
  type CohortRow,
} from "@/app/actions/cohorts";

const STATUS_OPTIONS: { value: CohortRow["status"]; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ENROLLMENT_OPEN", label: "Enrollment Open" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function CohortFormModal({
  courseSlug,
  cohort,
  instructors,
  onClose,
  onSaved,
}: {
  courseSlug: string;
  cohort?: CohortRow;
  instructors: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !cohort;
  const [name, setName] = useState(cohort?.name ?? "");
  const [startDate, setStartDate] = useState(toDateInputValue(cohort?.startDate ?? null));
  const [endDate, setEndDate] = useState(toDateInputValue(cohort?.endDate ?? null));
  const [enrollmentDeadline, setEnrollmentDeadline] = useState(
    toDateInputValue(cohort?.enrollmentDeadline ?? null),
  );
  const [orientationDate, setOrientationDate] = useState(
    toDateInputValue(cohort?.orientationDate ?? null),
  );
  const [capacity, setCapacity] = useState(cohort?.capacity ? String(cohort.capacity) : "");
  const [timezone, setTimezone] = useState(cohort?.timezone ?? "UTC");
  const [schedule, setSchedule] = useState(cohort?.schedule ?? "");
  const [instructorUserId, setInstructorUserId] = useState(cohort?.instructorUserId ?? "");
  const [status, setStatus] = useState<CohortRow["status"]>(cohort?.status ?? "UPCOMING");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const input = {
        name,
        startDate,
        endDate,
        enrollmentDeadline: enrollmentDeadline || undefined,
        orientationDate: orientationDate || undefined,
        capacity: capacity ? Number(capacity) : null,
        timezone,
        schedule,
        instructorUserId: instructorUserId || null,
      };

      const result = isNew
        ? await createCohortAction(courseSlug, input)
        : await updateCohortAction(cohort.id, input);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (!isNew && status !== cohort.status) {
        await setCohortStatusAction(cohort.id, status);
      }

      onSaved();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-800">{isNew ? "New Cohort" : "Edit Cohort"}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Cohort Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. January 2026 Cohort"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Enrollment Deadline
              </label>
              <input
                type="date"
                value={enrollmentDeadline}
                onChange={(e) => setEnrollmentDeadline(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Orientation Date</label>
              <input
                type="date"
                value={orientationDate}
                onChange={(e) => setOrientationDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Capacity</label>
              <input
                type="number"
                min={0}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. WAT, GMT+1"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Schedule</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Mon/Wed/Fri, 6-8pm"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Instructor</label>
              <select
                value={instructorUserId}
                onChange={(e) => setInstructorUserId(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              >
                <option value="">Unassigned</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            {!isNew && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CohortRow["status"])}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={pending || !name.trim() || !startDate || !endDate}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save Cohort"}
          </button>
        </div>
      </div>
    </div>
  );
}
