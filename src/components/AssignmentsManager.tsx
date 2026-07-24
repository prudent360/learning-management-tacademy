"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAssignmentAction, type AssignmentRow } from "@/app/actions/assignments";
import { AssignmentFormModal } from "@/components/AssignmentFormModal";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { ClipboardIcon } from "@/components/icons";

type ModalTarget = { mode: "new" } | { mode: "edit"; assignment: AssignmentRow } | null;

function formatDate(date: Date | null): string {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AssignmentsManager({
  courseSlug,
  cohortId,
  assignments,
  canEdit,
}: {
  courseSlug: string;
  cohortId: string;
  assignments: AssignmentRow[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<ModalTarget>(null);

  const handleSaved = () => {
    setTarget(null);
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
            + New Assignment
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-xl bg-surface-muted p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-800">{a.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{a.description}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>Due {formatDate(a.dueDate)}</span>
                  <span>Max score {a.maxScore}</span>
                  <span>
                    {a.submittedCount}/{a.enrolledCount} submitted · {a.gradedCount} graded
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  href={`/admin/courses/${courseSlug}/cohorts/${cohortId}/assignments/${a.id}`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Review Submissions
                </Link>
                {canEdit && (
                  <>
                    <button
                      onClick={() => setTarget({ mode: "edit", assignment: a })}
                      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <ConfirmDeleteButton
                      onDelete={deleteAssignmentAction.bind(null, a.id)}
                      itemLabel={a.title}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="rounded-lg border border-dashed border-line bg-surface p-12 text-center">
            <ClipboardIcon className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No assignments yet.</p>
            <p className="mt-1 text-xs text-muted">Create one for this cohort to start collecting submissions.</p>
          </div>
        )}
      </div>

      {target && (
        <AssignmentFormModal
          cohortId={cohortId}
          assignment={target.mode === "edit" ? target.assignment : undefined}
          onClose={() => setTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
