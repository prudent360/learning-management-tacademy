"use client";

import { logout } from "@/app/actions/auth";
import { LogoutIcon } from "@/components/icons";

export function AdminLogoutButton() {
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Hard navigation so any in-memory module store gets torn down —
      // matches the same rationale as UserMenu's student-facing logout.
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-surface-muted hover:text-red-600"
    >
      <LogoutIcon className="h-4 w-4" />
      Log out
    </button>
  );
}
