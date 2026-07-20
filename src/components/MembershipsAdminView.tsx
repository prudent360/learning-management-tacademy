"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MembershipPlanFormModal } from "@/components/MembershipPlanFormModal";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import {
  toggleMembershipPlanActiveAction,
  deleteMembershipPlanAction,
  type MembershipPlanRow,
  type MembershipMemberRow,
  type MembershipStats,
} from "@/app/actions/memberships";
import { formatCurrency } from "@/lib/currency";
import {
  TeamIcon,
  CrownIcon,
  TrophyIcon,
  AnalyticsIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@/components/icons";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-100 text-brand-green",
  pending: "bg-amber-50 text-amber-600",
  expired: "bg-slate-100 text-slate-500",
  failed: "bg-red-50 text-red-600",
};

function PlanCard({
  plan,
  currency,
  canEdit,
  canDelete,
}: {
  plan: MembershipPlanRow;
  currency: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [active, setActive] = useState(plan.active);
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      await toggleMembershipPlanActiveAction(plan.id, next);
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
          <p className="text-xs text-muted">Monthly</p>
        </div>
        <div className="flex items-center gap-1.5">
          {canEdit && (
            <button
              onClick={handleToggle}
              disabled={pending}
              aria-label={active ? "Deactivate plan" : "Activate plan"}
              className={`rounded-lg border p-1.5 transition-colors ${
                active
                  ? "border-green-200 bg-green-50 text-brand-green"
                  : "border-line bg-surface-muted text-slate-400"
              }`}
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
          {canEdit && <MembershipPlanFormModal plan={plan} currency={currency} />}
          {canDelete && (
            <ConfirmDeleteButton
              onDelete={deleteMembershipPlanAction.bind(null, plan.id)}
              itemLabel={plan.name}
            />
          )}
        </div>
      </div>

      <p className="mt-4 text-3xl font-extrabold text-slate-800">
        {formatCurrency(plan.price, currency)}
      </p>
      <p className="mt-1 text-sm font-bold text-orange">{plan.discountPct}% discount</p>

      <div className="mt-4 space-y-2 border-t border-line pt-4">
        {plan.perks.map((perk, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            {perk}
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
        {plan.activeMemberCount} active member{plan.activeMemberCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function MembershipsAdminView({
  initialPlans,
  members,
  stats,
  currency,
  canCreate,
  canEdit,
  canDelete,
}: {
  initialPlans: MembershipPlanRow[];
  members: MembershipMemberRow[];
  stats: MembershipStats;
  currency: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [tab, setTab] = useState<"plans" | "members">("plans");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memberships"
        subtitle="Manage membership plans and members."
        action={canCreate ? <MembershipPlanFormModal currency={currency} /> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TeamIcon} label="Active Members" value={stats.activeMembers} accent="green" />
        <StatCard icon={CrownIcon} label="Pending" value={stats.pending} accent="amber" />
        <StatCard
          icon={AnalyticsIcon}
          label="Revenue"
          value={formatCurrency(stats.revenue, stats.currency)}
          accent="navy"
        />
        <StatCard icon={TrophyIcon} label="Plans" value={stats.planCount} accent="purple" />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("plans")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "plans" ? "bg-orange text-white" : "bg-surface-muted text-slate-600"
          }`}
        >
          Plans
        </button>
        <button
          onClick={() => setTab("members")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "members" ? "bg-orange text-white" : "bg-surface-muted text-slate-600"
          }`}
        >
          Members
        </button>
      </div>

      {tab === "plans" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {initialPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currency={currency}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
          {initialPlans.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-muted">
              No membership plans yet.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-2 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{m.userName}</p>
                  <p className="truncate text-xs text-muted">
                    {m.userEmail} · {m.planName}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                  {m.currentPeriodEnd && (
                    <span>Renews {new Date(m.currentPeriodEnd).toLocaleDateString()}</span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                      STATUS_STYLE[m.status] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">No members yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof TeamIcon;
  label: string;
  value: number | string;
  accent: "green" | "amber" | "navy" | "purple";
}) {
  const accentClasses = {
    green: "bg-green-100 text-brand-green",
    amber: "bg-amber-50 text-amber-600",
    navy: "bg-navy-50 text-navy",
    purple: "bg-blue-100 text-blue-700",
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
