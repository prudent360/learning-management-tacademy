"use client";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
              <path d="M12 10v4.5" />
              <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              The application hit an unexpected error{error.digest ? ` (ref: ${error.digest})` : ""}.
            </p>
          </div>
          <button
            onClick={unstable_retry}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
