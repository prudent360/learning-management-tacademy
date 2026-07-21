"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction } from "@/app/actions/admin";
import { countries } from "@/lib/countries";
import { PencilIcon, CloseIcon } from "@/components/icons";

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
  other: "Other",
};

type UserForEdit = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  gender: string | null;
  country: string | null;
  certificateName: string | null;
};

export function EditUserModal({ user }: { user: UserForEdit }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    firstName: user.firstName,
    middleName: user.middleName ?? "",
    lastName: user.lastName,
    email: user.email,
    gender: user.gender ?? "",
    country: user.country ?? "",
    certificateName: user.certificateName ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateUserAction(user.id, values);
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
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      >
        <PencilIcon className="h-3.5 w-3.5" />
        Edit profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-sm font-bold text-slate-800">Edit User</p>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-surface-muted"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
                  <input
                    value={values.firstName}
                    onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
                  <input
                    value={values.lastName}
                    onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Middle name <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  value={values.middleName}
                  onChange={(e) => setValues((v) => ({ ...v, middleName: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
                  <select
                    value={values.gender}
                    onChange={(e) => setValues((v) => ({ ...v, gender: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  >
                    <option value="">Not set</option>
                    {Object.entries(GENDER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                  <select
                    value={values.country}
                    onChange={(e) => setValues((v) => ({ ...v, country: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  >
                    <option value="">Not set</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Certificate name <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  value={values.certificateName}
                  onChange={(e) => setValues((v) => ({ ...v, certificateName: e.target.value }))}
                  placeholder="Name printed on certificates, if different"
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
