"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/Logo";
import { forgotPassword } from "@/app/actions/auth";

export function ForgotPasswordForm({
  logoUrl,
  siteName,
}: {
  logoUrl?: string | null;
  siteName?: string | null;
}) {
  const [state, action, pending] = useActionState(forgotPassword, undefined);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-sm">
        <div className="flex justify-center">
          <Logo src={logoUrl} siteName={siteName} />
        </div>
        <h1 className="mt-6 text-center text-lg font-bold text-slate-800">
          Reset password
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          Enter your email address and we will send you a reset link.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
              required
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="block w-full rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending link…" : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-orange">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
