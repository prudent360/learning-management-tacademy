"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { Logo } from "@/components/Logo";
import { resetPassword } from "@/app/actions/auth";

function ResetPasswordFields() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [state, action, pending] = useActionState(resetPassword, undefined);

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
          required
        />
        {state?.errors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
        <input
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
          required
        />
      </div>

      {state?.message && (
        <div className={`rounded-lg px-3 py-2 text-sm ${
          state.message.includes("successfully")
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}>
          {state.message}
          {state.message.includes("successfully") && (
            <div className="mt-2 font-semibold">
              <Link href="/login" className="text-navy hover:underline">
                Click here to sign in &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Resetting…" : "Reset Password"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-sm">
        <div className="flex justify-center">
          <Logo src={logoUrl} />
        </div>
        <h1 className="mt-6 text-center text-lg font-bold text-slate-800">
          Set new password
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          Choose a secure password with at least 8 characters, letters, and numbers.
        </p>

        <Suspense fallback={<p className="mt-6 text-center text-sm text-muted">Loading form...</p>}>
          <ResetPasswordFields />
        </Suspense>

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
