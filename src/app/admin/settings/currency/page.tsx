import { requireAdmin } from "@/lib/dal";
import { getCurrencyRates } from "@/app/actions/settings";
import { CurrencyRatesForm } from "@/components/settings/CurrencyRatesForm";

export default async function CurrencySettingsPage() {
  await requireAdmin();
  const { baseCurrency, rates } = await getCurrencyRates();
  return <CurrencyRatesForm baseCurrency={baseCurrency} initialRates={rates} />;
}
