"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export async function getNotifications(): Promise<{
  items: NotificationItem[];
  unreadCount: number;
}> {
  const { userId } = await verifySession();

  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return {
    items: rows.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      href: n.href,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function markAllNotificationsRead(): Promise<void> {
  const { userId } = await verifySession();
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function markNotificationRead(id: string): Promise<void> {
  const { userId } = await verifySession();
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}
