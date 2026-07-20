"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "@/components/Menu";
import { BellIcon, UserIcon, CalendarIcon, CoursesIcon } from "@/components/icons";

type Note = {
  id: number;
  icon: typeof BellIcon;
  title: string;
  time: string;
  href: string;
};

const initial: Note[] = [
  {
    id: 1,
    icon: UserIcon,
    title: "3 new users registered today",
    time: "2h ago",
    href: "/admin/users",
  },
  {
    id: 2,
    icon: CalendarIcon,
    title: "A new coach booking is awaiting confirmation",
    time: "Yesterday",
    href: "/admin/coach-bookings",
  },
  {
    id: 3,
    icon: CoursesIcon,
    title: "The Interview Formula course was updated",
    time: "3 days ago",
    href: "/admin/courses",
  },
];

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-slate-500 transition-colors hover:bg-navy-50 hover:text-navy";

export function AdminNotificationsMenu() {
  const [unread, setUnread] = useState(initial.length);

  return (
    <Menu
      panelClassName="w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
      button={() => (
        <span className={`${iconBtn} relative`} aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange ring-2 ring-white" />
          )}
        </span>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-slate-800">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => setUnread(0)}
                className="text-xs font-semibold text-orange"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 divide-y divide-line overflow-y-auto">
            {initial.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={close}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-slate-700">{n.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{n.time}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </Menu>
  );
}
