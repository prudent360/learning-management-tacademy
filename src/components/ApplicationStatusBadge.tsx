type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "ADMITTED" | "REJECTED" | "WAITLISTED";

const style: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-blue-50 text-blue-600",
  UNDER_REVIEW: "bg-amber-50 text-amber-600",
  ADMITTED: "bg-green-100 text-brand-green",
  REJECTED: "bg-red-50 text-red-600",
  WAITLISTED: "bg-slate-100 text-slate-600",
};

const label: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ADMITTED: "Admitted",
  REJECTED: "Rejected",
  WAITLISTED: "Waitlisted",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style[status]}`}
    >
      {label[status]}
    </span>
  );
}
