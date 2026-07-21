"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createCoachAction,
  updateCoachAction,
  unlinkCoachAccountAction,
  listUsersAvailableForCoachLinking,
  type CoachAccent,
  type CoachRecord,
} from "@/app/actions/coaches";
import { Avatar } from "@/components/Avatar";
import { PlusIcon, CloseIcon, PencilIcon } from "@/components/icons";

const ACCENT_OPTIONS: CoachAccent[] = ["navy", "orange", "green", "slate"];

type AccountMode = "none" | "link" | "new";

type FormValues = {
  name: string;
  role: string;
  focus: string;
  bio: string;
  accent: CoachAccent;
  bookable: boolean;
  accountMode: AccountMode;
  linkUserId: string;
  newAccountEmail: string;
};

const emptyValues: FormValues = {
  name: "",
  role: "",
  focus: "",
  bio: "",
  accent: "navy",
  bookable: true,
  accountMode: "none",
  linkUserId: "",
  newAccountEmail: "",
};

export function CoachFormModal({ coach }: { coach?: CoachRecord }) {
  const router = useRouter();
  const isEdit = Boolean(coach);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(coach ? { ...emptyValues, ...coach } : emptyValues);
  const [linkableUsers, setLinkableUsers] = useState<{ id: string; name: string; email: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [unlinking, startUnlink] = useTransition();

  useEffect(() => {
    if (open && values.accountMode === "link" && linkableUsers === null) {
      listUsersAvailableForCoachLinking().then(setLinkableUsers);
    }
  }, [open, values.accountMode, linkableUsers]);

  const close = () => {
    setOpen(false);
    setError(null);
    setGeneratedPassword(null);
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
      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
        router.refresh();
        return;
      }
      close();
      router.refresh();
    });
  };

  const handleUnlink = () => {
    if (!coach) return;
    startUnlink(async () => {
      await unlinkCoachAccountAction(coach.id);
      router.refresh();
      close();
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

            {generatedPassword ? (
              <div className="space-y-4 p-5">
                <p className="text-sm font-bold text-slate-800">Account created</p>
                <p className="text-sm text-muted">
                  Share these sign-in details with the coach — this password is only shown once.
                </p>
                <div className="rounded-lg bg-surface-muted p-3 font-mono text-sm">{generatedPassword}</div>
                <button
                  onClick={close}
                  className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
                >
                  Done
                </button>
              </div>
            ) : (
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

                <div className="rounded-xl border border-line p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Coach portal account
                  </p>

                  {isEdit && coach!.hasAccount ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700">
                        Linked to <span className="font-semibold">{coach!.accountEmail}</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleUnlink}
                        disabled={unlinking}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {unlinking ? "Unlinking…" : "Unlink account"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={values.accountMode}
                        onChange={(e) => setValues((v) => ({ ...v, accountMode: e.target.value as AccountMode }))}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy-600"
                      >
                        <option value="none">No portal access yet</option>
                        <option value="link">Link an existing user (e.g. an instructor)</option>
                        <option value="new">Create a new account</option>
                      </select>

                      {values.accountMode === "link" && (
                        <select
                          value={values.linkUserId}
                          onChange={(e) => setValues((v) => ({ ...v, linkUserId: e.target.value }))}
                          required
                          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy-600"
                        >
                          <option value="">Select a user…</option>
                          {linkableUsers?.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} — {u.email}
                            </option>
                          ))}
                        </select>
                      )}

                      {values.accountMode === "new" && (
                        <input
                          type="email"
                          value={values.newAccountEmail}
                          onChange={(e) => setValues((v) => ({ ...v, newAccountEmail: e.target.value }))}
                          placeholder="coach@example.com"
                          required
                          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                        />
                      )}
                    </div>
                  )}
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Coach"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
