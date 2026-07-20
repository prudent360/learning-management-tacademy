"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetUserProgress } from "@/app/actions/admin";
import { CheckCircleIcon } from "@/components/icons";

type Step = "idle" | "confirming" | "done";

export function ResetProgressButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await resetUserProgress(userId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setStep("done");
      router.refresh();
    });
  };

  if (step === "done") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-brand-green">
        <CheckCircleIcon className="h-4 w-4" />
        Progress reset
      </div>
    );
  }

  if (step === "confirming") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">
          Reset all progress for this user?
        </p>
        <p className="mt-1 text-xs text-red-600">
          This clears all lesson completions, badges, XP and streak. This cannot be undone.
        </p>
        {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Resetting…" : "Yes, reset everything"}
          </button>
          <button
            onClick={() => setStep("idle")}
            disabled={pending}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirming")}
      className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
    >
      Reset all progress
    </button>
  );
}
