"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";

type Step = "idle" | "confirming";

export function ConfirmDeleteButton({
  onDelete,
  itemLabel,
}: {
  /** A bound server action, e.g. `deleteCourseAction.bind(null, slug)`. */
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  itemLabel: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      let result: { success: boolean; error?: string };
      try {
        result = await onDelete();
      } catch (err) {
        result = { success: false, error: err instanceof Error ? err.message : "Failed to delete." };
      }
      if (!result.success) {
        setError(result.error ?? "Failed to delete.");
        return;
      }
      router.refresh();
    });
  };

  if (step === "confirming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
        <span className="text-xs font-semibold text-red-700">
          {error ?? `Delete ${itemLabel}?`}
        </span>
        <button
          onClick={handleConfirm}
          disabled={pending}
          className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Confirm"}
        </button>
        <button
          onClick={() => setStep("idle")}
          disabled={pending}
          className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirming")}
      aria-label={`Delete ${itemLabel}`}
      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
