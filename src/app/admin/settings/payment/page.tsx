import { requireAdmin } from "@/lib/dal";
import { getOrderCurrency, listPaymentGateways } from "@/app/actions/settings";
import { PaymentGatewaySettings } from "@/components/settings/PaymentGatewaySettings";

export default async function PaymentSettingsPage() {
  await requireAdmin();
  const [currency, gateways] = await Promise.all([getOrderCurrency(), listPaymentGateways()]);
  return <PaymentGatewaySettings currency={currency} gateways={gateways} />;
}
