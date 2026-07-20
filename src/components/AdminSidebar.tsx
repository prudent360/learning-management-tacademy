import Link from "next/link";
import { AdminNavLinks } from "@/components/AdminNavLinks";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminIcon, ArrowLeftIcon } from "@/components/icons";
import type { CurrentUser } from "@/lib/dal";

export function AdminSidebar({ admin }: { admin: CurrentUser }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy text-white">
            <AdminIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-slate-800">TekSkillUp Admin</span>
        </div>
      </div>

      <AdminNavLinks />

      <div className="space-y-1 border-t border-line px-4 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-navy"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to app
        </Link>
        <p className="truncate px-4 pt-1 text-xs text-muted">{admin.name}</p>
        <AdminLogoutButton />
      </div>
    </aside>
  );
}
