"use client";

import { useState } from "react";
import type { MyAssignmentRow } from "@/app/actions/assignments";
import { SubmissionStatusBadge } from "@/components/SubmissionStatusBadge";
import { SubmitAssignmentModal } from "@/components/SubmitAssignmentModal";

function formatDate(date: Date | null): string {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AssignmentsSummary({ assignments }: { assignments: MyAssignmentRow[] }) {
  const [target, setTarget] = useState<MyAssignmentRow | null>(null);

  if (assignments.length === 0) return null;

  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="px-2 py-2">
        <p className="text-sm font-bold text-slate-800">Assignments</p>
      </div>

      <div className="space-y-2 px-2 pb-2">
        {assignments.map((a) => {
          const s = a.submission;
          const buttonLabel = !s
            ? "Submit"
            : s.status === "RESUBMISSION_REQUESTED"
              ? "Resubmit"
              : "View";
          return (
            <div key={a.id} className="rounded-xl bg-surface-muted p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800">{a.title}</p>
                  <p className="text-[11px] text-muted">Due {formatDate(a.dueDate)}</p>
                </div>
                {s && <SubmissionStatusBadge status={s.status} />}
              </div>
              {s?.grade != null && (
                <p className="mt-1 text-[11px] font-bold text-slate-700">
                  Grade: {s.grade}/{a.maxScore}
                </p>
              )}
              <button
                onClick={() => setTarget(a)}
                className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {buttonLabel}
              </button>
            </div>
          );
        })}
      </div>

      {target && (
        <SubmitAssignmentModal
          assignment={target}
          onClose={() => setTarget(null)}
          onSaved={() => setTarget(null)}
        />
      )}
    </div>
  );
}
