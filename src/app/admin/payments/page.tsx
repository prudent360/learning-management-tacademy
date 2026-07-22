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
import { StatCard } from "@/components/StatCard";
import { formatCurrency } from "@/lib/currency";
import { CheckCircleIcon, ClockIcon, CloseIcon, ArrowLeftIcon } from "@/components/icons";

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

      <div className="rounded-2xl border border-line bg-surface">
        {/* Table — sm and up */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Gateway</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-slate-500">
                    {p.providerRef}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={p.userName} accent="navy" size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{p.userName}</p>
                        <p className="truncate text-xs text-muted">{p.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted">{p.courseTitle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-extrabold text-slate-800">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs capitalize text-muted">{p.provider}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === "pending" && <PendingPaymentActions paymentId={p.id} />}
                      {p.status === "success" && <MarkRefundedButton paymentId={p.id} />}
                      <EditPaymentModal
                        paymentId={p.id}
                        amount={p.amount}
                        currency={p.currency}
                        providerRef={p.providerRef}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No transactions match these filters.</p>
          )}
        </div>

        {/* Cards — below sm, a table can't fit this many columns on a phone screen */}
        <div className="space-y-2 p-4 sm:hidden">
          {payments.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4">
              <div className="flex items-start gap-3">
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
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="text-sm font-extrabold text-slate-800">
                  {formatCurrency(p.amount, p.currency)}
                </span>
                <span className="capitalize">{p.provider}</span>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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
