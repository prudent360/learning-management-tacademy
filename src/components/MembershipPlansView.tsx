"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { initMembershipPaymentAction, type StudentPlan } from "@/app/actions/memberships";
import type { GatewayId, CheckoutGateway } from "@/app/actions/settings";
import { formatCurrency } from "@/lib/currency";
import { CheckCircleIcon, CrownIcon } from "@/components/icons";

function PlanCard({
  plan,
  currency,
  gateways,
}: {
  plan: StudentPlan;
  currency: string;
  gateways: CheckoutGateway[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingGateway, setPendingGateway] = useState<GatewayId | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = (gatewayId: GatewayId) => {
    setError(null);
    setPendingGateway(gatewayId);
    startTransition(async () => {
      const res = await initMembershipPaymentAction(plan.id, gatewayId);
      if (!res.success) {
        setError(res.error);
        setPendingGateway(null);
        return;
      }
      window.location.href = res.paymentLink;
    });
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-surface p-5 ${
        plan.isCurrent ? "border-orange ring-1 ring-orange" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
        {plan.isCurrent && (
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600">
            <CrownIcon className="h-3.5 w-3.5" />
            Your plan
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-extrabold text-slate-800">
        {formatCurrency(plan.price, currency)}
        <span className="text-sm font-medium text-muted"> /month</span>
      </p>
      {plan.discountPct > 0 && (
        <p className="mt-1 text-sm font-bold text-orange">{plan.discountPct}% off every course</p>
      )}

      <div className="mt-4 flex-1 space-y-2 border-t border-line pt-4">
        {plan.perks.map((perk, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
            {perk}
          </div>
        ))}
      </div>

      <div className="mt-5">
        {plan.isCurrent ? (
          <div className="rounded-lg bg-surface-muted py-2.5 text-center text-sm font-semibold text-muted">
            Active membership
          </div>
        ) : !expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="w-full rounded-lg bg-navy py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-700"
          >
            Subscribe
          </button>
        ) : gateways.length === 0 ? (
          <p className="rounded-lg bg-surface-muted py-2.5 text-center text-xs text-muted">
            Payment isn&apos;t currently available.
          </p>
        ) : (
          <div className="space-y-2">
            {gateways.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSubscribe(g.id)}
                disabled={pending}
                className="w-full rounded-lg bg-orange py-2.5 text-sm font-bold text-white transition-all hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending && pendingGateway === g.id
                  ? "Processing…"
                  : `Pay with ${g.label} →`}
              </button>
            ))}
          </div>
        )}
        {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export function MembershipPlansView({
  plans,
  currency,
  gateways,
}: {
  plans: StudentPlan[];
  currency: string;
  gateways: CheckoutGateway[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership"
        subtitle="Subscribe for a discount on every course, plus member perks."
      />

      {plans.length === 0 ? (
        <div className="rounded-2xl bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No membership plans available yet</p>
          <p className="mt-1 text-xs text-muted">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} currency={currency} gateways={gateways} />
          ))}
        </div>
      )}
    </div>
  );
}
