"use client";

import Link from "next/link";
import { Menu } from "@/components/Menu";
import { BellIcon, TrophyIcon, CheckCircleIcon, CalendarIcon } from "@/components/icons";
import { useNotifications } from "@/lib/useNotifications";
import type { NotificationItem } from "@/app/actions/notifications";

const KIND_ICON: Record<string, typeof BellIcon> = {
  enrollment: CheckCircleIcon,
  certificate: TrophyIcon,
  coach_booking: CalendarIcon,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-slate-500 transition-colors hover:bg-navy-50 hover:text-navy";

export function NotificationsMenu() {
  const { items, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <Menu
      panelClassName="w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
      button={() => (
        <span className={`${iconBtn} relative`} aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange ring-2 ring-white" />
          )}
        </span>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-orange">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 divide-y divide-line overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No notifications yet.
              </p>
            )}
            {items.map((n: NotificationItem) => {
              const Icon = KIND_ICON[n.kind] ?? BellIcon;
              return (
                <Link
                  key={n.id}
                  href={n.href ?? "#"}
                  onClick={() => {
                    markRead(n.id);
                    close();
                  }}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-muted ${
                    n.read ? "" : "bg-navy-50/40"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-slate-700">{n.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange" />
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </Menu>
  );
}
