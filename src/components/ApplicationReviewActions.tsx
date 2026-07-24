"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { admitApplicationAction, rejectApplicationAction } from "@/app/actions/applications";
import { CheckIcon, CloseIcon } from "@/components/icons";

export function ApplicationReviewActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<"admit" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: "admit" | "reject") => {
    setError(null);
    startTransition(async () => {
      const result =
        action === "admit"
          ? await admitApplicationAction(applicationId)
          : await rejectApplicationAction(applicationId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConfirming(null);
      router.refresh();
    });
  };

  if (confirming) {
    const isAdmit = confirming === "admit";
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold ${isAdmit ? "text-green-700" : "text-red-700"}`}>
          {error ?? (isAdmit ? "Admit this applicant?" : "Reject this application?")}
        </span>
        <button
          onClick={() => run(confirming)}
          disabled={pending}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isAdmit ? "bg-brand-green hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {pending ? "Working…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(null)}
          disabled={pending}
          className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setConfirming("admit")}
        className="flex items-center gap-1 rounded-lg bg-brand-green px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
      >
        <CheckIcon className="h-3.5 w-3.5" />
        Admit
      </button>
      <button
        onClick={() => setConfirming("reject")}
        className="flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <CloseIcon className="h-3.5 w-3.5" />
        Reject
      </button>
    </div>
  );
}
