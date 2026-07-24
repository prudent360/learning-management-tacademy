"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  duplicateCohortAction,
  setCohortStatusAction,
  type CohortRow,
} from "@/app/actions/cohorts";
import { CohortStatusBadge } from "@/components/CohortStatusBadge";
import { CohortFormModal } from "@/components/CohortFormModal";
import { CalendarIcon, UserIcon } from "@/components/icons";

type ModalTarget = { mode: "new" } | { mode: "edit"; cohort: CohortRow } | null;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function CohortManager({
  courseSlug,
  cohorts,
  instructors,
  canEdit,
}: {
  courseSlug: string;
  cohorts: CohortRow[];
  instructors: { id: string; name: string }[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<ModalTarget>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleSaved = () => {
    setTarget(null);
    router.refresh();
  };

  const handleDuplicate = async (id: string) => {
    setPendingId(id);
    await duplicateCohortAction(id);
    setPendingId(null);
    router.refresh();
  };

  const handleCloseEnrollment = async (id: string) => {
    setPendingId(id);
    await setCohortStatusAction(id, "ONGOING");
    setPendingId(null);
    router.refresh();
  };

  const handleArchive = async (id: string) => {
    setPendingId(id);
    await setCohortStatusAction(id, "ARCHIVED");
    setPendingId(null);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setTarget({ mode: "new" })}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700"
          >
            + New Cohort
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {cohorts.map((c) => {
          const seatsLabel =
            c.capacity != null ? `${c.enrolledCount}/${c.capacity} seats` : `${c.enrolledCount} enrolled`;
          const seatsFull = c.capacity != null && c.enrolledCount >= c.capacity;

          return (
            <div key={c.id} className="rounded-xl bg-surface-muted p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{c.name}</h3>
                    <CohortStatusBadge status={c.status} />
                    {seatsFull && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                        Full
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {formatDate(c.startDate)} – {formatDate(c.endDate)}
                    </span>
                    {c.instructorName && (
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5" />
                        {c.instructorName}
                      </span>
                    )}
                    <span>{seatsLabel}</span>
                    {c.schedule && <span>{c.schedule}</span>}
                    {c.timezone && <span>{c.timezone}</span>}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/courses/${courseSlug}/cohorts/${c.id}/attendance`}
                      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Take Attendance
                    </Link>
                    <button
                      onClick={() => setTarget({ mode: "edit", cohort: c })}
                      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(c.id)}
                      disabled={pendingId === c.id}
                      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                    >
                      Duplicate
                    </button>
                    {c.status === "ENROLLMENT_OPEN" && (
                      <button
                        onClick={() => handleCloseEnrollment(c.id)}
                        disabled={pendingId === c.id}
                        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                      >
                        Close Enrollment
                      </button>
                    )}
                    {c.status !== "ARCHIVED" && (
                      <button
                        onClick={() => handleArchive(c.id)}
                        disabled={pendingId === c.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {cohorts.length === 0 && (
          <div className="rounded-lg border border-dashed border-line bg-surface p-12 text-center">
            <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No cohorts yet.</p>
            <p className="mt-1 text-xs text-muted">
              Create one to start scheduling this program's next intake.
            </p>
          </div>
        )}
      </div>

      {target && (
        <CohortFormModal
          courseSlug={courseSlug}
          cohort={target.mode === "edit" ? target.cohort : undefined}
          instructors={instructors}
          onClose={() => setTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
