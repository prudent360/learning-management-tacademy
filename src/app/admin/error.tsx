"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorFallback error={error} onRetry={unstable_retry} homeHref="/admin" homeLabel="Go to admin home" />;
}
