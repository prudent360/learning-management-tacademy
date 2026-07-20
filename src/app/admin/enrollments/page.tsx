import { requirePermission } from "@/lib/dal";
import {
  listEnrollments,
  listEnrollableCourses,
  type ListEnrollmentsFilters,
} from "@/app/actions/enrollments";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { EnrollmentSourceBadge } from "@/components/EnrollmentSourceBadge";
import { EnrollmentsFilterBar } from "@/components/EnrollmentsFilterBar";
import { EnrollmentsExportButton } from "@/components/EnrollmentsExportButton";
import { getPaymentConfig } from "@/app/actions/settings";
import { UserIcon, CheckCircleIcon, CreditCardIcon, GraduationIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/currency";
import type { ComponentType, SVGProps } from "react";

const SORTS: ListEnrollmentsFilters["sort"][] = ["newest", "oldest"];

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; course?: string; sort?: string }>;
}) {
  await requirePermission("enrollments:view");

  const params = await searchParams;
  const sort = SORTS.includes(params.sort as ListEnrollmentsFilters["sort"])
    ? (params.sort as ListEnrollmentsFilters["sort"])
    : "newest";

  const [enrollments, courses, paymentConfig] = await Promise.all([
    listEnrollments({ q: params.q, courseSlug: params.course, sort }),
    listEnrollableCourses(),
    getPaymentConfig(),
  ]);
  const currency = paymentConfig.currency || "NGN";

  const freeCount = enrollments.filter((e) => e.source === "free").length;
  const paidCount = enrollments.filter((e) => e.source === "paid").length;
  const grantedCount = enrollments.filter((e) => e.source === "granted").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        subtitle={`${enrollments.length} enrollments across all courses`}
        action={<EnrollmentsExportButton enrollments={enrollments} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserIcon} label="Total Enrollments" value={enrollments.length} accent="navy" />
        <StatCard icon={GraduationIcon} label="Free" value={freeCount} accent="blue" />
        <StatCard icon={CreditCardIcon} label="Paid" value={paidCount} accent="green" />
        <StatCard icon={CheckCircleIcon} label="Granted" value={grantedCount} accent="amber" />
      </div>

      <EnrollmentsFilterBar courses={courses} />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-2">
          {enrollments.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <Avatar name={e.userName} accent="navy" size={40} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-800">{e.userName}</p>
                  <EnrollmentSourceBadge source={e.source} />
                </div>
                <p className="truncate text-xs text-muted">
                  {e.userEmail} · {e.courseTitle}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                <span className="text-sm font-extrabold text-slate-800">
                  {e.coursePrice > 0 ? formatCurrency(e.coursePrice, currency) : "Free"}
                </span>
                {e.paymentProvider && <span className="capitalize">{e.paymentProvider}</span>}
                <span>{new Date(e.enrolledAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {enrollments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No enrollments match these filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  accent: "navy" | "blue" | "green" | "amber";
}) {
  const accentClasses = {
    navy: "bg-navy-50 text-navy",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-100 text-brand-green",
    amber: "bg-amber-50 text-amber-600",
  } as const;

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
