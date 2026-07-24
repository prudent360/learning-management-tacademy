"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/lib/nav";
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
    <nav className="scroll-thin flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {group.title}
          </h3>
          {group.items.map((item) => {
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
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-navy text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-navy-50 hover:text-navy"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="pt-2 border-t border-line">
        <button
          onClick={() => {
            onNavigate?.();
            handleLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-navy-50 hover:text-navy text-left cursor-pointer"
        >
          <LogoutIcon className="h-4.5 w-4.5 shrink-0" />
          Log out
        </button>
      </div>
    </nav>
  );
}
