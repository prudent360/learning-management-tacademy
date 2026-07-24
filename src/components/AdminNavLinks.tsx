"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "@/lib/nav";

export function AdminNavLinks({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const granted = new Set(permissions);

  return (
    <nav className="scroll-thin flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
      {adminNavGroups.map((group) => {
        const visibleItems = group.items.filter(
          (item) => !item.permission || granted.has(item.permission),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </h3>
            {visibleItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
        );
      })}
    </nav>
  );
}
