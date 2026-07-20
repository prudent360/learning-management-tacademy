"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMembershipPlanAction,
  updateMembershipPlanAction,
  type MembershipPlanRow,
} from "@/app/actions/memberships";
import { currencySymbol } from "@/lib/currency";
import { PlusIcon, CloseIcon, PencilIcon } from "@/components/icons";

type FormValues = {
  name: string;
  price: number;
  discountPct: number;
  perksText: string;
  active: boolean;
};

const emptyValues: FormValues = {
  name: "",
  price: 0,
  discountPct: 0,
  perksText: "",
  active: true,
};

export function MembershipPlanFormModal({
  plan,
  currency,
}: {
  plan?: MembershipPlanRow;
  currency: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(plan);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(
    plan
      ? {
          name: plan.name,
          price: plan.price,
          discountPct: plan.discountPct,
          perksText: plan.perks.join("\n"),
          active: plan.active,
        }
      : emptyValues,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setError(null);
    if (!isEdit) setValues(emptyValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const input = {
      name: values.name,
      price: values.price,
      discountPct: values.discountPct,
      perks: values.perksText.split("\n"),
      active: values.active,
    };
    startTransition(async () => {
      const result = isEdit
        ? await updateMembershipPlanAction(plan!.id, input)
        : await createMembershipPlanAction(input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Edit ${plan!.name}`}
          className="rounded-lg border border-line bg-surface p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange/90"
        >
          <PlusIcon className="h-4 w-4" />
          Add Plan
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-sm font-bold text-slate-800">
                {isEdit ? "Edit Plan" : "Add Plan"}
              </p>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-surface-muted"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Plan name</label>
                <input
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  placeholder="Pro"
                  required
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Price / month ({currencySymbol(currency)})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={values.price}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, price: Number(e.target.value) || 0 }))
                    }
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={values.discountPct}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, discountPct: Number(e.target.value) || 0 }))
                    }
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Perks (one per line)
                </label>
                <textarea
                  rows={4}
                  value={values.perksText}
                  onChange={(e) => setValues((v) => ({ ...v, perksText: e.target.value }))}
                  placeholder={"10% discount on all courses\nMember badge on profile\nEmail support"}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={values.active}
                  onChange={(e) => setValues((v) => ({ ...v, active: e.target.checked }))}
                  className="h-4 w-4 accent-navy"
                />
                Visible to students
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
              >
                {pending ? "Saving…" : isEdit ? "Save changes" : "Create plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
