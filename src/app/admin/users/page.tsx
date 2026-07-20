import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { listUsers, type ListUsersFilters } from "@/app/actions/admin";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UsersToolbarActions } from "@/components/UsersToolbarActions";
import { UsersFilterBar } from "@/components/UsersFilterBar";
import { ArrowRightIcon } from "@/components/icons";
import type { Category } from "@prisma/client";

const SORTS: ListUsersFilters["sort"][] = ["newest", "oldest", "name"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  await requireAdmin(); // defense in depth, independent of the layout's own check

  const params = await searchParams;
  const sort = SORTS.includes(params.sort as ListUsersFilters["sort"])
    ? (params.sort as ListUsersFilters["sort"])
    : "newest";
  const category = params.category as Category | undefined;

  const users = await listUsers({ q: params.q, category, sort });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage registered users"
        action={<UsersToolbarActions users={users} />}
      />

      <UsersFilterBar />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-2">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/admin/users/${u.id}`}
              className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4 transition-colors hover:bg-navy-50 sm:flex-row sm:items-center sm:gap-4"
            >
              <Avatar name={u.name} accent={u.role === "ADMIN" ? "orange" : "navy"} size={40} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-800">{u.name}</p>
                  <CategoryBadge category={u.category} />
                </div>
                <p className="truncate text-xs text-muted">{u.email}</p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                <span>
                  <span className="font-semibold text-slate-700">{u.gamification?.xp ?? 0}</span> XP
                </span>
                <span>
                  <span className="font-semibold text-slate-700">{u.gamification?.streak ?? 0}</span>{" "}
                  day streak
                </span>
                <span>
                  <span className="font-semibold text-slate-700">
                    {u._count.lessonCompletions}
                  </span>{" "}
                  lessons
                </span>
                <span>
                  <span className="font-semibold text-slate-700">{u._count.badges}</span> badges
                </span>
                <span>{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>

              <ArrowRightIcon className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </Link>
          ))}

          {users.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No users match these filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
