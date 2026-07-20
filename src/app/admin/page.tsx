import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { requireAdmin } from "@/lib/dal";
import { listUsers, getCompletedTodayCount } from "@/app/actions/admin";
import { getLeaderboardAction } from "@/app/actions/gamification";
import { getCourses, getPracticeExams } from "@/lib/courses-server";
import { Avatar } from "@/components/Avatar";
import {
  UserIcon,
  CoursesIcon,
  ClipboardIcon,
  CheckCircleIcon,
  TrophyIcon,
  ArrowRightIcon,
  SettingsIcon,
} from "@/components/icons";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [users, courses, examsMap, completedToday, leaderboard] = await Promise.all([
    listUsers(),
    getCourses(),
    getPracticeExams(),
    getCompletedTodayCount(),
    getLeaderboardAction(),
  ]);
  const exams = Object.values(examsMap);
  const recentUsers = users.slice(0, 5);
  const topLearners = leaderboard.xpLeaderboard.slice(0, 5);
  const firstName = admin.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="rounded-2xl bg-navy px-6 py-8 md:px-8 md:py-10">
        <h1 className="text-2xl font-extrabold text-white md:text-3xl">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-white/70">Overview of your learning platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserIcon} label="Total Users" value={users.length} accent="navy" />
        <StatCard icon={CoursesIcon} label="Active Courses" value={courses.length} accent="blue" />
        <StatCard icon={ClipboardIcon} label="Exams Configured" value={exams.length} accent="amber" />
        <StatCard icon={CheckCircleIcon} label="Completed Today" value={completedToday} accent="green" />
      </div>

      {/* Three-column overview */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent users */}
        <Panel
          title="Recent Users"
          action={
            <Link href="/admin/users" className="flex items-center gap-1 text-xs font-semibold text-orange hover:underline">
              View all
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          }
        >
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="flex items-center gap-3 rounded-xl bg-surface-muted p-3 transition-colors hover:bg-navy-50"
              >
                <Avatar name={u.name} accent={u.role === "ADMIN" ? "orange" : "navy"} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{u.name}</p>
                  <p className="truncate text-xs text-muted">
                    {u.role === "ADMIN" ? "Administrator" : "Student"} · {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
            {recentUsers.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">No users yet.</p>
            )}
          </div>
        </Panel>

        {/* Top learners */}
        <Panel
          title="Top Learners"
          icon={<TrophyIcon className="h-5 w-5 text-orange" />}
          action={<span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">By XP</span>}
        >
          <div className="space-y-2">
            {topLearners.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 rounded-xl bg-surface-muted p-3"
              >
                <RankBadge rank={entry.rank} />
                <Avatar name={entry.name} accent="navy" size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{maskName(entry.name)}</p>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-slate-800">
                  {entry.xp}
                  <span className="ml-1 text-xs font-medium text-muted">XP</span>
                </span>
              </div>
            ))}
            {topLearners.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">No learner activity yet.</p>
            )}
          </div>
        </Panel>

        {/* Quick actions */}
        <Panel title="Quick Actions">
          <div className="space-y-2">
            <QuickAction
              href="/admin/users"
              icon={UserIcon}
              accent="navy"
              title="Manage Users"
              description="View and manage registered users"
            />
            <QuickAction
              href="/admin/courses"
              icon={CoursesIcon}
              accent="blue"
              title="Manage Courses"
              description="Create and edit LMS courses"
            />
            <QuickAction
              href="/admin/exams"
              icon={ClipboardIcon}
              accent="amber"
              title="Manage Exams"
              description="Configure practice exams"
            />
            <QuickAction
              href="/admin/settings"
              icon={SettingsIcon}
              accent="green"
              title="Settings"
              description="Payment, SMTP, and general config"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

// Masks a learner's name for privacy on a shared leaderboard, e.g. "Daniel U***".
function maskName(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  return `${parts.slice(0, -1).join(" ")} ${last[0]}***`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-orange">
        <TrophyIcon className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-sm font-bold text-muted">
      {rank}
    </span>
  );
}

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  accent,
  title,
  description,
}: {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: keyof typeof accentClasses;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-surface-muted p-3.5 transition-colors hover:bg-navy-50"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentClasses[accent]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="truncate text-xs text-muted">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  );
}

const accentClasses = {
  navy: "bg-navy-50 text-navy",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-100 text-brand-green",
  amber: "bg-amber-50 text-amber-600",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  accent: keyof typeof accentClasses;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5">
      <Icon
        className={`pointer-events-none absolute -right-3 -top-3 h-24 w-24 opacity-[0.06] ${accentClasses[accent].split(" ")[1]}`}
      />
      <div className="relative flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentClasses[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold text-slate-800">{value}</p>
          <p className="truncate text-xs font-medium text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
