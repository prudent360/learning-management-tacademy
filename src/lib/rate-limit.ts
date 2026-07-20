import "server-only";
import { headers } from "next/headers";

/** Best-effort caller IP from proxy headers; falls back to a shared bucket when unavailable (e.g. local dev). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

type Bucket = { count: number; resetAt: number };

// In-memory fixed-window limiter. Resets on server restart and isn't shared
// across instances — fine for this app's single-instance deployment; move to
// a shared store (e.g. Redis) if this ever runs behind multiple processes.
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Opportunistic sweep so abandoned keys don't accumulate forever.
  if (Math.random() < 0.01) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

function formatRetryAfter(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}

export function rateLimitMessage(result: Extract<RateLimitResult, { allowed: false }>): string {
  return `Too many attempts. Please try again in ${formatRetryAfter(result.retryAfterSeconds)}.`;
}
