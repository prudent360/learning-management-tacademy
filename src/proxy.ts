import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const publicPaths = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/landing-page",
]);
// Authenticated visitors land on the dashboard, not the marketing homepage.
const publicOnlyPaths = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    publicPaths.has(pathname) ||
    pathname === "/verify" ||
    pathname.startsWith("/verify/") ||
    // Webhook routes are called by payment providers with no session cookie —
    // they authenticate the request themselves via signature verification.
    pathname.startsWith("/api/webhooks/");
  const isPublicOnly = publicOnlyPaths.has(pathname);

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);
  let isAuthed = Boolean(session?.userId);

  // A validly-signed session for a user that no longer exists (e.g. an admin
  // just deleted the account) must never be treated as authenticated.
  // Otherwise the deleted user's browser gets stuck bouncing off a
  // redirect() deep inside a Server Component (getCurrentUser in dal.ts),
  // which is unreliable under this app's loading.tsx Suspense boundaries —
  // the same class of bug fixed elsewhere in this file by gating here instead.
  if (isAuthed) {
    const user = await prisma.user.findUnique({
      where: { id: session!.userId },
      select: { id: true },
    });
    if (!user) isAuthed = false;
  }

  if (!isAuthed && !isPublic) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  if (isAuthed && isPublicOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Stale cookie for a deleted user on an otherwise-public page — clear it
  // so the next request doesn't repeat this lookup, but let the page load.
  if (!isAuthed && cookie) {
    const response = NextResponse.next();
    response.cookies.delete("session");
    return response;
  }

  // Coach portal gating happens here (before any rendering starts) rather
  // than via redirect() inside the page — see requireCoach() in dal.ts for
  // why: a page-level redirect() is unreliable under this route's loading.tsx
  // Suspense boundary in this app's Next.js version.
  if (isAuthed && request.method === "GET" && pathname.startsWith("/coach")) {
    const coach = await prisma.coach.findUnique({
      where: { userId: session!.userId },
      select: { id: true },
    });
    if (!coach) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // "uploads" is excluded alongside Next's own static paths: admin-uploaded
  // assets (e.g. branding logos) live under /uploads and must be fetchable
  // by logged-out visitors on public pages — an <img> request routed through
  // this proxy would otherwise get redirected to /login like any other
  // unauthenticated request to a non-public path.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
