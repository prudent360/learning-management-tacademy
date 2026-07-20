import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { decrypt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

/** Like verifySession but returns null instead of redirecting when not authenticated. */
export const getOptionalSession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) return null;
  return { userId: session.userId };
});

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  certificateName: string | null;
  role: Role;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const { userId } = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, certificateName: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
});

/** Redirects non-admins to "/". Use at the top of admin layouts/pages and every admin Server Action. */
export const requireAdmin = cache(async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
});
