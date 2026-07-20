"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/Logo";
import { signup } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-sm">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-lg font-bold text-slate-800">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          Start your e-Learning Centre journey
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input
              name="name"
              type="text"
              defaultValue={state?.values?.name}
              placeholder="Ifiok Ekpo"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
            )}
          </div>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
            {state?.errors?.password && (
              <div className="mt-1 text-xs text-red-600">
                <p>Password must:</p>
                <ul className="list-inside list-disc">
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
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
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-orange">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
