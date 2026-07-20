import type { PaymentStatus } from "@/app/actions/admin-payments";

const style: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-600",
  success: "bg-green-100 text-brand-green",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-slate-100 text-slate-600",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = (style[status as PaymentStatus] ? status : "pending") as PaymentStatus;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style[s]}`}
    >
      {status}
    </span>
  );
}
