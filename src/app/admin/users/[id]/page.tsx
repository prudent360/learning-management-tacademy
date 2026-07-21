import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/dal";
import { getUserDetail } from "@/app/actions/admin";
import { lessonCount } from "@/lib/courses";
import { getCourses } from "@/lib/courses-server";
import { levelFromXP, XP_PER_LEVEL, BADGES } from "@/lib/gamification";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { ProgressRing } from "@/components/ProgressRing";
import { CategorySelect } from "@/components/CategorySelect";
import { ResetProgressButton } from "@/components/ResetProgressButton";
import { EditUserModal } from "@/components/EditUserModal";
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { ArrowLeftIcon } from "@/components/icons";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("users:view");
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  const xp = detail.gamification?.xp ?? 0;
  const streak = detail.gamification?.streak ?? 0;
  const level = levelFromXP(xp);
  const nextLevelXP = level * XP_PER_LEVEL;
  const prevLevelXP = (level - 1) * XP_PER_LEVEL;
  const levelProgress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  const unlockedBadgeIds = new Set(detail.badges.map((b) => b.badgeId));

  const allCourses = await getCourses();

  const courseProgress = allCourses.map((course) => {
    const total = lessonCount(course);
    const done = detail.lessonCompletions.filter((c) => c.courseSlug === course.slug).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { course, done, total, pct };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.name}
        subtitle={detail.email}
        action={
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            All users
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Gamification */}
          <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Gamification</h2>
            <div className="flex items-center gap-5">
              <ProgressRing value={Math.round(levelProgress)} size={72} stroke={8} label={`Lvl ${level}`} />
              <div>
                <p className="text-lg font-bold text-slate-800">{xp} XP</p>
                <p className="text-sm text-muted">{nextLevelXP - xp} XP to Level {level + 1}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-orange-600">
                  <span aria-hidden>🔥</span>
                  {streak} day{streak !== 1 ? "s" : ""} streak
                </p>
              </div>
            </div>
          </div>

          {/* Course progress */}
          <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Course progress</h2>
            <div className="space-y-3">
              {courseProgress.map(({ course, done, total, pct }) => (
                <div
                  key={course.slug}
                  className="flex items-center gap-4 rounded-xl border border-line p-4"
                >
                  <ProgressRing value={pct} size={48} stroke={5} label={`${pct}%`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{course.title}</p>
                    <p className="text-xs text-muted">
                      {done}/{total} lessons complete
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Badges <span className="font-normal text-muted">({unlockedBadgeIds.size}/{BADGES.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BADGES.map((badge) => {
                const unlocked = unlockedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center rounded-xl border p-4 text-center ${
                      unlocked ? "border-orange/30 bg-orange-50" : "border-line bg-surface-muted opacity-50"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {badge.icon}
                    </span>
                    <p className="mt-2 text-xs font-bold text-slate-800">{badge.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: profile + actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar name={detail.name} accent={detail.role === "ADMIN" ? "orange" : "navy"} size={48} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{detail.name}</p>
                <p className="truncate text-xs text-muted">{detail.email}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Role</dt>
                <dd className="font-semibold text-slate-800">{detail.role}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Joined</dt>
                <dd className="font-semibold text-slate-800">
                  {new Date(detail.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <EditUserModal
                user={{
                  id: detail.id,
                  firstName: detail.firstName,
                  middleName: detail.middleName,
                  lastName: detail.lastName,
                  email: detail.email,
                  gender: detail.gender,
                  country: detail.country,
                  certificateName: detail.certificateName,
                }}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Category</p>
            <CategorySelect userId={detail.id} category={detail.category} />
            <p className="text-xs text-muted">
              Setting the category to Admin grants admin-panel access; any other category is a
              standard account.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Danger zone</p>
            <ResetProgressButton userId={detail.id} />
            <DeleteUserButton userId={detail.id} userName={detail.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
