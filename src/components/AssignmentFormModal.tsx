"use client";

import { useState, useTransition } from "react";
import {
  createAssignmentAction,
  updateAssignmentAction,
  type AssignmentRow,
} from "@/app/actions/assignments";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function AssignmentFormModal({
  cohortId,
  assignment,
  onClose,
  onSaved,
}: {
  cohortId: string;
  assignment?: AssignmentRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !assignment;
  const [title, setTitle] = useState(assignment?.title ?? "");
  const [description, setDescription] = useState(assignment?.description ?? "");
  const [dueDate, setDueDate] = useState(toDateInputValue(assignment?.dueDate ?? null));
  const [maxScore, setMaxScore] = useState(String(assignment?.maxScore ?? 100));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const input = {
        title,
        description,
        dueDate: dueDate || undefined,
        maxScore: Number(maxScore) || 100,
      };
      const result = isNew
        ? await createAssignmentAction(cohortId, input)
        : await updateAssignmentAction(assignment.id, input);

      if (!result.success) {
        setError(result.error);
        return;
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
        <h2 className="text-sm font-bold text-slate-800">{isNew ? "New Assignment" : "Edit Assignment"}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a REST API"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What should students submit, and how will it be graded?"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Max Score</label>
              <input
                type="number"
                min={1}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
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
            disabled={pending || !title.trim()}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
