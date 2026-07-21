"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/app/actions/categories";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { CategoryFormModal } from "@/components/CategoryFormModal";
import { TagIcon } from "@/components/icons";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
};

type ModalTarget = { mode: "new" } | { mode: "edit"; id: string; name: string } | null;

export function CategoriesListClient({
  categories,
  canCreate,
  canEdit,
  canDelete,
}: {
  categories: CategoryRow[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<ModalTarget>(null);

  const handleSaved = () => {
    setTarget(null);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      {canCreate && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setTarget({ mode: "new" })}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700"
          >
            + New Category
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                <TagIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-800">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {cat.courseCount} course{cat.courseCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => setTarget({ mode: "edit", id: cat.id, name: cat.name })}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Rename
                </button>
              )}
              {canDelete && (
                <ConfirmDeleteButton
                  onDelete={deleteCategoryAction.bind(null, cat.id)}
                  itemLabel={cat.name}
                />
              )}
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="rounded-lg border border-dashed border-line bg-surface p-12 text-center">
            <TagIcon className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No categories yet.</p>
            <p className="mt-1 text-xs text-muted">
              Create one so courses can be tagged by topic.
            </p>
          </div>
        )}
      </div>

      {target && (
        <CategoryFormModal target={target} onClose={() => setTarget(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
