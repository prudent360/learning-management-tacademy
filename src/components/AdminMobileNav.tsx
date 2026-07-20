"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminNavLinks } from "@/components/AdminNavLinks";
import { AdminIcon, ArrowLeftIcon, MenuIcon, CloseIcon } from "@/components/icons";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-navy-50 hover:text-navy"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-white">
              <AdminIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-slate-800">TekSkillUp Admin</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-navy-50 hover:text-navy"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <AdminNavLinks />
        <div className="border-t border-line px-4 py-4">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-navy"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to app
          </Link>
        </div>
      </aside>
    </div>
  );
}
