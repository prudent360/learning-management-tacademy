"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/lib/nav";

export function AdminNavLinks({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const granted = new Set(permissions);
  const visibleItems = adminNavItems.filter(
    (item) => !item.permission || granted.has(item.permission),
  );

  return (
    <nav className="scroll-thin flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4">
      {visibleItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
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
    </nav>
  );
}
