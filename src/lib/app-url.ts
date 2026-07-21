import "server-only";
import { headers } from "next/headers";

/**
 * Returns the base application URL.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_APP_URL (if configured)
 * 2. Dynamically constructed from request headers (Host, X-Forwarded-Host, X-Forwarded-Proto)
 * 3. Fallback to http://localhost:3000 for local development
 */
export async function getAppUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto =
      headersList.get("x-forwarded-proto") ||
      (host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https");

    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // Falling back if invoked outside request context
  }

  return "http://localhost:3000";
}
