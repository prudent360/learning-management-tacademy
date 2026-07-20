"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { LogoutIcon } from "@/components/icons";
import { logout } from "@/app/actions/auth";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="scroll-thin flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-6">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "bg-navy text-white shadow-sm"
                : "text-slate-600 hover:bg-navy-50 hover:text-navy"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}

      <button
        onClick={() => {
          onNavigate?.();
          handleLogout();
        }}
        className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-navy-50 hover:text-navy text-left cursor-pointer"
      >
        <LogoutIcon className="h-5 w-5 shrink-0" />
        Log out
      </button>
    </nav>
  );
}
