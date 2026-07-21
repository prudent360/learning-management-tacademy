import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const publicPaths = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password"]);
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
  const isAuthed = Boolean(session?.userId);

  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthed && isPublicOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
