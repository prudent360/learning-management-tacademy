"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <AuthSplitLayout
      heading="Welcome back. Let's keep the momentum going."
      subheading="Pick up right where you left off — your progress, exams, and coaching sessions are all here."
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to your e-Learning Centre</p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={state?.values?.email}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-orange hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="block w-full rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-orange">
            Register
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
