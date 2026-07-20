"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markPaymentRefunded } from "@/app/actions/admin-payments";

export function MarkRefundedButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await markPaymentRefunded(paymentId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-red-700">{error ?? "Refund this?"}</span>
        <button
          onClick={handleConfirm}
          disabled={pending}
          className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Refunding…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
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
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      Mark Refunded
    </button>
  );
}
