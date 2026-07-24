import type { SubmissionStatus } from "@/app/actions/assignments";

const style: Record<SubmissionStatus, string> = {
  SUBMITTED: "bg-blue-50 text-blue-600",
  UNDER_REVIEW: "bg-amber-50 text-amber-600",
  GRADED: "bg-green-100 text-brand-green",
  RESUBMISSION_REQUESTED: "bg-red-50 text-red-600",
};

const label: Record<SubmissionStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  GRADED: "Graded",
  RESUBMISSION_REQUESTED: "Resubmission Requested",
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style[status]}`}
    >
      {label[status]}
    </span>
  );
}
