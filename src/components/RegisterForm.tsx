"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
  other: "Other",
};

const HEAR_ABOUT_US_LABELS: Record<string, string> = {
  social_media: "Social media",
  friend_referral: "Friend or colleague",
  search_engine: "Search engine",
  advertisement: "Advertisement",
  other: "Other",
};

export function RegisterForm({ logoUrl }: { logoUrl?: string | null }) {
  const [state, action, pending] = useActionState(signup, undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <AuthSplitLayout
      heading="Pass your assessments with a plan, not luck."
      subheading="Join thousands of learners preparing with structured courses, timed practice exams, and real coaching."
      logoUrl={logoUrl}
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Start your e-Learning Centre journey</p>

        <form action={action} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
              <input
                name="firstName"
                type="text"
                defaultValue={state?.values?.firstName}
                placeholder="Ifiok"
                required
                className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
              />
              {state?.errors?.firstName && (
                <p className="mt-1 text-xs text-red-600">{state.errors.firstName[0]}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
              <input
                name="lastName"
                type="text"
                defaultValue={state?.values?.lastName}
                placeholder="Ekpo"
                required
                className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
              />
              {state?.errors?.lastName && (
                <p className="mt-1 text-xs text-red-600">{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Middle name <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              name="middleName"
              type="text"
              defaultValue={state?.values?.middleName}
              placeholder="Sam"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
              <select
                name="gender"
                defaultValue={state?.values?.gender ?? ""}
                required
                className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
              >
                <option value="" disabled>
                  Select…
                </option>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {state?.errors?.gender && (
                <p className="mt-1 text-xs text-red-600">{state.errors.gender[0]}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">How'd you hear about us?</label>
              <select
                name="hearAboutUs"
                defaultValue={state?.values?.hearAboutUs ?? ""}
                required
                className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
              >
                <option value="" disabled>
                  Select…
                </option>
                {Object.entries(HEAR_ABOUT_US_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {state?.errors?.hearAboutUs && (
                <p className="mt-1 text-xs text-red-600">{state.errors.hearAboutUs[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={state?.values?.email}
              placeholder="you@example.com"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
            <PasswordStrengthMeter password={password} />
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
            />
            {confirmMismatch && <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>}
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending || confirmMismatch}
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
    </AuthSplitLayout>
  );
}
