"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@prisma/client";
import { createUserAction } from "@/app/actions/admin";
import { CATEGORY_LABELS } from "@/components/CategoryBadge";
import { PlusIcon, CloseIcon, CheckCircleIcon } from "@/components/icons";

const CATEGORY_OPTIONS: Category[] = ["STUDENT", "INSTRUCTOR", "ADMIN", "AFFILIATE", "STAFF"];

export function AddUserModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setEmail("");
    setCategory("STUDENT");
    setError(null);
    setCreated(null);
  };

  const close = () => {
    setOpen(false);
    reset();
    if (created) router.refresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createUserAction({ name, email, category });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCreated({ email: email.trim().toLowerCase(), password: result.generatedPassword });
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-orange px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
      >
        <PlusIcon className="h-4 w-4" />
        Add User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-sm font-bold text-slate-800">
                {created ? "User created" : "Add User"}
              </p>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-surface-muted"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {created ? (
              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4">
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-brand-green" />
                  <p className="text-sm text-slate-700">
                    Account created for <span className="font-semibold">{created.email}</span>.
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Temporary password
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted px-3 py-2.5">
                    <code className="flex-1 truncate text-sm font-semibold text-slate-800">
                      {created.password}
                    </code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(created.password)}
                      className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Share this with the user directly — it won&apos;t be shown again. They can
                    change it any time from the login page&apos;s &ldquo;Forgot password&rdquo; link.
                  </p>
                </div>
                <button
                  onClick={close}
                  className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    required
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Creating…" : "Create User"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
