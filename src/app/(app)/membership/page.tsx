import { listActiveMembershipPlans } from "@/app/actions/memberships";
import { getPaymentConfig } from "@/app/actions/settings";
import { MembershipPlansView } from "@/components/MembershipPlansView";
import { MembershipPaymentConfirming } from "@/components/MembershipPaymentConfirming";

export default async function MembershipPage({
  searchParams,
}: {
  // Reference presence alone signals we're back from checkout — see
  // enrollment.ts's initFincraPayment for why the return URL has no query
  // params of our own (the gateway appends its own "?reference=...").
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const referenceVal = Array.isArray(reference) ? reference[0] : reference;

  if (referenceVal) {
    return <MembershipPaymentConfirming reference={referenceVal} />;
  }

  const [plans, paymentConfig] = await Promise.all([
    listActiveMembershipPlans(),
    getPaymentConfig(),
  ]);

  return (
    <MembershipPlansView plans={plans} currency={paymentConfig.currency} gateways={paymentConfig.gateways} />
  );
}
