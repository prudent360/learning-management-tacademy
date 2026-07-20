"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyMembershipAction } from "@/app/actions/memberships";
import { CheckCircleIcon, AlertTriangleIcon } from "@/components/icons";
import { refreshNotifications } from "@/lib/useNotifications";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 16; // ~40s

export function MembershipPaymentConfirming({ reference }: { reference: string }) {
  const router = useRouter();
  const [state, setState] = useState<"waiting" | "failed" | "timeout">("waiting");
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      let result: Awaited<ReturnType<typeof verifyMembershipAction>>;
      try {
        result = await verifyMembershipAction(reference);
      } catch (err) {
        console.error("Membership verification check failed:", err);
        if (cancelled) return;
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setState("timeout");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
        return;
      }
      if (cancelled) return;

      if (result.active) {
        refreshNotifications();
        router.replace("/membership");
        return;
      }
      if (result.failed) {
        setState("failed");
        return;
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setState("timeout");
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [reference, router]);

  if (state === "failed") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertTriangleIcon className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Payment didn&apos;t go through</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            It looks like this payment wasn&apos;t successful. No charge should have been made — you
            can try again below.
          </p>
        </div>
        <Link
          href="/membership"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
        >
          Back to plans
        </Link>
      </div>
    );
  }

  if (state === "timeout") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangleIcon className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Still confirming your payment</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            This is taking longer than usual. If you completed the payment, it should confirm
            shortly — try refreshing in a minute, or contact support if it doesn&apos;t.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Check again
          </button>
          <Link
            href="/contact-support"
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-surface-muted"
          >
            Contact support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-brand-green">
        <CheckCircleIcon className="h-7 w-7 animate-pulse" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-800">Confirming your payment…</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          This usually takes just a few seconds. Please don&apos;t close this page.
        </p>
      </div>
    </div>
  );
}
