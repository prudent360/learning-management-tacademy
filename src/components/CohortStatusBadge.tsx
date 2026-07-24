import type { CohortRow } from "@/app/actions/cohorts";

const style: Record<CohortRow["status"], string> = {
  UPCOMING: "bg-blue-50 text-blue-600",
  ENROLLMENT_OPEN: "bg-green-100 text-brand-green",
  ONGOING: "bg-navy-50 text-navy",
  COMPLETED: "bg-slate-100 text-slate-600",
  ARCHIVED: "bg-red-50 text-red-600",
};

const label: Record<CohortRow["status"], string> = {
  UPCOMING: "Upcoming",
  ENROLLMENT_OPEN: "Enrollment Open",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export function CohortStatusBadge({ status }: { status: CohortRow["status"] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style[status]}`}
    >
      {label[status]}
    </span>
  );
}
