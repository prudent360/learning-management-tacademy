"use client";

import { useState, useTransition } from "react";
import { createCategoryAction, renameCategoryAction } from "@/app/actions/categories";

type CategoryTarget = { mode: "new" } | { mode: "edit"; id: string; name: string };

export function CategoryFormModal({
  target,
  onClose,
  onSaved,
}: {
  target: CategoryTarget;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(target.mode === "edit" ? target.name : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result =
        target.mode === "edit"
          ? await renameCategoryAction(target.id, { name })
          : await createCategoryAction({ name });
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
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-800">
          {target.mode === "edit" ? "Rename Category" : "New Category"}
        </h2>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Name</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Data Analysis"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
          />
          {target.mode === "edit" && (
            <p className="mt-1.5 text-[11px] text-muted">
              Renaming updates the category on every course currently using it.
            </p>
          )}
          {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={pending || !name.trim()}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
