"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePaymentDetails } from "@/app/actions/admin-payments";
import { PencilIcon, CloseIcon } from "@/components/icons";

export function EditPaymentModal({
  paymentId,
  amount,
  currency,
  providerRef,
}: {
  paymentId: string;
  amount: number;
  currency: string;
  providerRef: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ amount, currency, providerRef });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setError(null);
    setValues({ amount, currency, providerRef });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updatePaymentDetails(paymentId, values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Edit payment"
        className="rounded-lg border border-line bg-surface p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-sm font-bold text-slate-800">Edit Payment</p>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-surface-muted"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={values.amount}
                    onChange={(e) => setValues((v) => ({ ...v, amount: Number(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Currency</label>
                  <input
                    value={values.currency}
                    onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
                    maxLength={3}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm uppercase outline-none focus:border-navy-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Provider reference</label>
                <input
                  value={values.providerRef}
                  onChange={(e) => setValues((v) => ({ ...v, providerRef: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 font-mono text-xs outline-none focus:border-navy-600"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
