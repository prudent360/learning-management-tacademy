import type { EnrollmentSource } from "@/app/actions/enrollments";

const style: Record<EnrollmentSource, string> = {
  free: "bg-navy-50 text-navy",
  paid: "bg-green-100 text-brand-green",
  granted: "bg-amber-50 text-amber-600",
};

const label: Record<EnrollmentSource, string> = {
  free: "Free",
  paid: "Paid",
  granted: "Granted",
};

export function EnrollmentSourceBadge({ source }: { source: EnrollmentSource }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style[source]}`}
    >
      {label[source]}
    </span>
  );
}
