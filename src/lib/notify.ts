import "server-only";
import { prisma } from "@/lib/prisma";

export type NotificationKind = "enrollment" | "certificate" | "coach_booking" | "membership" | "application";

/** Creates an in-app notification for one user. Call from server actions after the real event succeeds. */
export async function notify(
  userId: string,
  kind: NotificationKind,
  title: string,
  href?: string,
) {
  await prisma.notification.create({
    data: { userId, kind, title, href },
  });
}
