"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { verifyEmailAction, resendVerificationCodeAction } from "@/app/actions/auth";
import type { VerifyEmailFormState } from "@/lib/definitions";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmailForm({
  email,
  logoUrl,
  siteName,
}: {
  email: string;
  logoUrl?: string | null;
  siteName?: string | null;
}) {
  const [state, action, pending] = useActionState<VerifyEmailFormState, FormData>(
    verifyEmailAction,
    undefined,
  );
  const [cooldown, setCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage(null);
    const result = await resendVerificationCodeAction(email);
    setResending(false);
    if (result.success) {
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setResendMessage("A new 6-digit code has been sent to your email.");
    } else {
      setResendMessage(result.error);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-sm">
        <div className="flex justify-center">
          <Logo src={logoUrl} siteName={siteName} />
        </div>
        <h1 className="mt-6 text-center text-lg font-bold text-slate-800">Verify your email</h1>
        <p className="mt-1 text-center text-sm text-muted">
          We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
        </p>

        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="email" value={email} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Verification code</label>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              required
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-navy-600"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="block w-full rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {resendMessage && <p className="mb-2 text-xs text-muted">{resendMessage}</p>}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="font-semibold text-orange hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend code (${cooldown}s)` : resending ? "Sending…" : "Resend code"}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Wrong email?{" "}
          <Link href="/register" className="font-semibold text-orange">
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}
