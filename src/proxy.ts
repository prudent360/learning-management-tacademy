import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { ADMIN_PATH_PERMISSIONS } from "@/lib/permissions";
import { getUserPermissionKeys } from "@/lib/permissions-server";

const publicPaths = new Set(["/", "/login", "/register"]);
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

  // Admin-tier permission gating for GET page loads. Done here (before any
  // rendering starts) rather than via redirect() inside the page components —
  // see ADMIN_PATH_PERMISSIONS' comment for why.
  if (isAuthed && request.method === "GET" && pathname.startsWith("/admin/")) {
    const match = ADMIN_PATH_PERMISSIONS.find((p) => pathname.startsWith(p.prefix));
    if (match) {
      const user = await prisma.user.findUnique({
        where: { id: session!.userId },
        select: { role: true },
      });
      if (user?.role === "ADMIN") {
        const keys = await getUserPermissionKeys(session!.userId);
        if (!keys.has(match.permission)) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
