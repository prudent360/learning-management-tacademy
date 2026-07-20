"use client";

import Link from "next/link";
import { Menu } from "@/components/Menu";
import { Avatar } from "@/components/Avatar";
import { useCurrentUser } from "@/lib/user-context";
import { logout } from "@/app/actions/auth";
import {
  CoursesIcon,
  ProgramIcon,
  SupportIcon,
  LogoutIcon,
  ChevronDownIcon,
  AdminIcon,
} from "@/components/icons";

export function UserMenu() {
  const user = useCurrentUser();

  const links = [
    { label: "My Courses", href: "/my-courses", icon: CoursesIcon },
    { label: "Program Overview", href: "/program-overview", icon: ProgramIcon },
    { label: "Help & Support", href: "/contact-support", icon: SupportIcon },
    ...(user.role === "ADMIN"
      ? [{ label: "Admin Panel", href: "/admin", icon: AdminIcon }]
      : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Hard navigation (not a client-side transition) so every in-memory
      // module store (gamification/progress caches) is torn down — a
      // different account logging in on this tab must never see stale data.
      window.location.href = "/login";
    }
  };

  return (
    <Menu
      panelClassName="w-60 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lg"
      button={() => (
        <span className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-surface-muted">
          <Avatar name={user.name} accent="orange" size={38} />
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </span>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-3 border-b border-line px-3 pb-3 pt-2">
            <Avatar name={user.name} accent="orange" size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <div className="py-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-navy-50 hover:text-navy"
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-line pt-1">
            <button
              onClick={() => {
                close();
                handleLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogoutIcon className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </Menu>
  );
}
