import { requirePermission } from "@/lib/dal";
import {
  listEnrollments,
  listEnrollableCourses,
  type ListEnrollmentsFilters,
  type EnrollmentSource,
} from "@/app/actions/enrollments";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { EnrollmentSourceBadge } from "@/components/EnrollmentSourceBadge";
import { EnrollmentsFilterBar } from "@/components/EnrollmentsFilterBar";
import { EnrollmentsExportButton } from "@/components/EnrollmentsExportButton";
import { getPaymentConfig } from "@/app/actions/settings";
import { StatCard } from "@/components/StatCard";
import { UserIcon, CheckCircleIcon, CreditCardIcon, GraduationIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/currency";

const SORTS: ListEnrollmentsFilters["sort"][] = ["newest", "oldest"];
const SOURCES: EnrollmentSource[] = ["free", "paid", "granted"];

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; course?: string; source?: string; sort?: string }>;
}) {
  await requirePermission("enrollments:view");

  const params = await searchParams;
  const sort = SORTS.includes(params.sort as ListEnrollmentsFilters["sort"])
    ? (params.sort as ListEnrollmentsFilters["sort"])
    : "newest";
  const source = SOURCES.includes(params.source as EnrollmentSource)
    ? (params.source as EnrollmentSource)
    : undefined;

  const [enrollments, courses, paymentConfig] = await Promise.all([
    listEnrollments({ q: params.q, courseSlug: params.course, source, sort }),
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

      <div className="rounded-2xl border border-line bg-surface">
        {/* Table — sm and up */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Provider</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {new Date(e.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={e.userName} accent="navy" size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{e.userName}</p>
                        <p className="truncate text-xs text-muted">{e.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-xs text-muted">{e.courseTitle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-extrabold text-slate-800">
                    {e.coursePrice > 0 ? formatCurrency(e.coursePrice, currency) : "Free"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <EnrollmentSourceBadge source={e.source} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs capitalize text-muted">
                    {e.paymentProvider ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {enrollments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No enrollments match these filters.</p>
          )}
        </div>

        {/* Cards — below sm, a table can't fit this many columns on a phone screen */}
        <div className="space-y-2 p-4 sm:hidden">
          {enrollments.map((e) => (
            <div key={e.id} className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4">
              <div className="flex items-start gap-3">
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
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
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
