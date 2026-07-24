"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/user-context";

export function UnverifiedEmailBanner() {
  const user = useCurrentUser();

  if (!user || user.emailVerified) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <svg
            className="h-5 w-5 shrink-0 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-xs font-semibold sm:text-sm">
            Your email address (<strong>{user.email}</strong>) is not verified. Please verify your email to enable enrollments and purchases.
          </p>
        </div>
        <Link
          href="/verify-email"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-700"
        >
          Verify Email
        </Link>
      </div>
    </div>
  );
}
