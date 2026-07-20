"use client";

import { AdminMobileNav } from "@/components/AdminMobileNav";
import { AdminSearchCommand } from "@/components/AdminSearchCommand";
import { AdminNotificationsMenu } from "@/components/AdminNotificationsMenu";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCurrentUser } from "@/lib/user-context";

export function AdminTopBar() {
  const user = useCurrentUser();
  const firstName = user.name.split(" ")[0];

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-surface px-4 py-3.5 md:px-6 lg:px-8">
      <AdminMobileNav />

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">
          Welcome, {firstName}, to the Admin Panel!
        </p>
        <p className="truncate text-xs text-muted">Manage your learning platform</p>
      </div>

      <div className="mx-auto hidden max-w-md flex-1 lg:block">
        <AdminSearchCommand />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <AdminNotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
