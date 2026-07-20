"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon } from "@/components/icons";

export function ErrorFallback({
  error,
  onRetry,
  homeHref = "/",
  homeLabel = "Go home",
  fullScreen = false,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
  homeHref?: string;
  homeLabel?: string;
  fullScreen?: boolean;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-6 text-center ${
        fullScreen ? "min-h-screen" : "min-h-[50vh]"
      }`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertTriangleIcon className="h-7 w-7" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          An unexpected error occurred{error.digest ? ` (ref: ${error.digest})` : ""}. You can try again or head
          back.
        </p>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={onRetry}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
        >
          Try again
        </button>
        <Link
          href={homeHref}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-surface-muted"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
