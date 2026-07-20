"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCoachAction, updateCoachAction, type CoachAccent, type CoachRecord } from "@/app/actions/coaches";
import { Avatar } from "@/components/Avatar";
import { PlusIcon, CloseIcon, PencilIcon } from "@/components/icons";

const ACCENT_OPTIONS: CoachAccent[] = ["navy", "orange", "green", "slate"];

type FormValues = {
  name: string;
  role: string;
  focus: string;
  bio: string;
  accent: CoachAccent;
  bookable: boolean;
};

const emptyValues: FormValues = {
  name: "",
  role: "",
  focus: "",
  bio: "",
  accent: "navy",
  bookable: true,
};

export function CoachFormModal({ coach }: { coach?: CoachRecord }) {
  const router = useRouter();
  const isEdit = Boolean(coach);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(coach ?? emptyValues);
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
    startTransition(async () => {
      const result = isEdit
        ? await updateCoachAction(coach!.id, values)
        : await createCoachAction(values);
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
          aria-label={`Edit ${coach!.name}`}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-orange px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
        >
          <PlusIcon className="h-4 w-4" />
          Add Coach
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-sm font-bold text-slate-800">{isEdit ? "Edit Coach" : "Add Coach"}</p>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-surface-muted"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <div className="flex items-center gap-3">
                <Avatar name={values.name || "New Coach"} accent={values.accent} size={44} />
                <div>
                  <select
                    value={values.accent}
                    onChange={(e) => setValues((v) => ({ ...v, accent: e.target.value as CoachAccent }))}
                    className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-navy-600"
                  >
                    {ACCENT_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a[0].toUpperCase() + a.slice(1)} avatar
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  placeholder="Dr. Jane Doe"
                  required
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                <input
                  value={values.role}
                  onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
                  placeholder="Interview Coach"
                  required
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Focus</label>
                <input
                  value={values.focus}
                  onChange={(e) => setValues((v) => ({ ...v, focus: e.target.value }))}
                  placeholder="Competency & strengths interviews"
                  required
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  value={values.bio}
                  onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
                  placeholder="Short background shown on the coach's profile."
                  required
                  rows={3}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={values.bookable}
                  onChange={(e) => setValues((v) => ({ ...v, bookable: e.target.checked }))}
                  className="h-4 w-4 rounded border-line accent-navy"
                />
                Bookable by students
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Coach"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
