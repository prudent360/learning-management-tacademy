import { requirePermission } from "@/lib/dal";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import {
  listApplications,
  getApplicationStats,
  type ListApplicationsFilters,
} from "@/app/actions/applications";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { ApplicationsFilterBar } from "@/components/ApplicationsFilterBar";
import { ApplicationReviewActions } from "@/components/ApplicationReviewActions";
import { ApplicationIcon, ClockIcon, CheckCircleIcon, CloseIcon } from "@/components/icons";

const SORTS: ListApplicationsFilters["sort"][] = ["newest", "oldest"];
const STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ADMITTED", "REJECTED", "WAITLISTED"] as const;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const admin = await requirePermission("applications:view");

  const params = await searchParams;
  const sort = SORTS.includes(params.sort as ListApplicationsFilters["sort"])
    ? (params.sort as ListApplicationsFilters["sort"])
    : "newest";
  const status = STATUSES.includes(params.status as (typeof STATUSES)[number])
    ? (params.status as (typeof STATUSES)[number])
    : undefined;

  const [applications, stats, permissions] = await Promise.all([
    listApplications({ q: params.q, status, sort }),
    getApplicationStats(),
    getUserPermissionKeys(admin.id),
  ]);
  const canReview = permissions.has("applications:edit");

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" subtitle="Program admissions across all cohorts" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ApplicationIcon}
          label="Awaiting Review"
          value={stats.SUBMITTED + stats.UNDER_REVIEW}
          accent="blue"
        />
        <StatCard icon={CheckCircleIcon} label="Admitted" value={stats.ADMITTED} accent="green" />
        <StatCard icon={CloseIcon} label="Rejected" value={stats.REJECTED} accent="red" />
        <StatCard icon={ClockIcon} label="Waitlisted" value={stats.WAITLISTED} accent="amber" />
      </div>

      <ApplicationsFilterBar />

      <div className="rounded-2xl border border-line bg-surface">
        {/* Table — sm and up */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Cohort</th>
                <th className="px-4 py-3">Status</th>
                {canReview && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={a.userName} accent="navy" size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{a.userName}</p>
                        <p className="truncate text-xs text-muted">{a.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted">{a.courseTitle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{a.cohortName ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <ApplicationStatusBadge status={a.status} />
                  </td>
                  {canReview && (
                    <td className="whitespace-nowrap px-4 py-3">
                      {(a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") && (
                        <ApplicationReviewActions applicationId={a.id} />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {applications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No applications match these filters.</p>
          )}
        </div>

        {/* Cards — below sm */}
        <div className="space-y-2 p-4 sm:hidden">
          {applications.map((a) => (
            <div key={a.id} className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4">
              <div className="flex items-start gap-3">
                <Avatar name={a.userName} accent="navy" size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-800">{a.userName}</p>
                    <ApplicationStatusBadge status={a.status} />
                  </div>
                  <p className="truncate text-xs text-muted">
                    {a.userEmail} · {a.courseTitle}
                  </p>
                  {a.cohortName && <p className="truncate text-xs text-muted">{a.cohortName}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                {canReview && (a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") && (
                  <ApplicationReviewActions applicationId={a.id} />
                )}
              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No applications match these filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
