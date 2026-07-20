import { listActiveMembershipPlans } from "@/app/actions/memberships";
import { getPaymentConfig } from "@/app/actions/settings";
import { MembershipPlansView } from "@/components/MembershipPlansView";
import { MembershipPaymentConfirming } from "@/components/MembershipPaymentConfirming";

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; reference?: string }>;
}) {
  const { payment, reference } = await searchParams;
  const paymentVal = Array.isArray(payment) ? payment[0] : payment;
  const referenceVal = Array.isArray(reference) ? reference[0] : reference;

  if (paymentVal === "success" && referenceVal) {
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
