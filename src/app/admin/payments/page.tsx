import { requirePermission } from "@/lib/dal";
import { listPayments, getPaymentStats, type ListPaymentsFilters, type PaymentStatus } from "@/app/actions/admin-payments";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { PaymentsFilterBar } from "@/components/PaymentsFilterBar";
import { PaymentsExportButton } from "@/components/PaymentsExportButton";
import { MarkRefundedButton } from "@/components/MarkRefundedButton";
import { PendingPaymentActions } from "@/components/PendingPaymentActions";
import { EditPaymentModal } from "@/components/EditPaymentModal";
import { formatCurrency } from "@/lib/currency";
import { CheckCircleIcon, ClockIcon, CloseIcon, ArrowLeftIcon } from "@/components/icons";
import type { ComponentType, SVGProps } from "react";

const SORTS: ListPaymentsFilters["sort"][] = ["newest", "oldest", "amount"];
const STATUSES: PaymentStatus[] = ["pending", "success", "failed", "refunded"];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  await requirePermission("payments:view");

  const params = await searchParams;
  const sort = SORTS.includes(params.sort as ListPaymentsFilters["sort"])
    ? (params.sort as ListPaymentsFilters["sort"])
    : "newest";
  const status = STATUSES.includes(params.status as PaymentStatus)
    ? (params.status as PaymentStatus)
    : undefined;

  const [payments, stats] = await Promise.all([
    listPayments({ q: params.q, status, sort }),
    getPaymentStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Transactions across all courses"
        action={<PaymentsExportButton payments={payments} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.revenueByCurrency.length === 0 ? (
          <StatCard icon={CheckCircleIcon} label="Revenue collected" value="—" accent="green" />
        ) : (
          stats.revenueByCurrency.map((r) => (
            <StatCard
              key={r.currency}
              icon={CheckCircleIcon}
              label={`Revenue (${r.currency})`}
              value={formatCurrency(r.total, r.currency)}
              accent="green"
            />
          ))
        )}
        <StatCard icon={ClockIcon} label="Pending" value={stats.counts.pending} accent="amber" />
        <StatCard icon={CloseIcon} label="Failed" value={stats.counts.failed} accent="red" />
        <StatCard icon={ArrowLeftIcon} label="Refunded" value={stats.counts.refunded} accent="slate" />
      </div>

      <PaymentsFilterBar />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <Avatar name={p.userName} accent="navy" size={40} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-800">{p.userName}</p>
                  <PaymentStatusBadge status={p.status} />
                </div>
                <p className="truncate text-xs text-muted">
                  {p.userEmail} · {p.courseTitle}
                </p>
                <p className="truncate font-mono text-[11px] text-slate-400">{p.providerRef}</p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                <span className="text-sm font-extrabold text-slate-800">
                  {formatCurrency(p.amount, p.currency)}
                </span>
                <span className="capitalize">{p.provider}</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {p.status === "pending" && <PendingPaymentActions paymentId={p.id} />}
                {p.status === "success" && <MarkRefundedButton paymentId={p.id} />}
                <EditPaymentModal
                  paymentId={p.id}
                  amount={p.amount}
                  currency={p.currency}
                  providerRef={p.providerRef}
                />
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No transactions match these filters.</p>
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
  value: number | string;
  accent: "green" | "amber" | "red" | "slate";
}) {
  const accentClasses = {
    green: "bg-green-100 text-brand-green",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
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
