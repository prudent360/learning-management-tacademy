/**
 * Country → currency mapping for the profile page's country picker.
 * The currency must be one of the codes formatCurrency/CurrencyRate support
 * (see src/lib/currency.ts). Countries without a directly supported local
 * currency fall back to USD as the nearest international default — this
 * only feeds a display-only converted price estimate, never a real charge.
 */
export type CountryOption = { name: string; currency: string };

export const countries: CountryOption[] = [
  { name: "Nigeria", currency: "NGN" },
  { name: "Ghana", currency: "GHS" },
  { name: "Kenya", currency: "KES" },
  { name: "South Africa", currency: "ZAR" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "United States", currency: "USD" },
  { name: "Canada", currency: "USD" },
  { name: "Australia", currency: "USD" },
  { name: "Egypt", currency: "USD" },
  { name: "Morocco", currency: "USD" },
  { name: "Algeria", currency: "USD" },
  { name: "Tunisia", currency: "USD" },
  { name: "Tanzania", currency: "USD" },
  { name: "Uganda", currency: "USD" },
  { name: "Rwanda", currency: "USD" },
  { name: "Ethiopia", currency: "USD" },
  { name: "Cameroon", currency: "USD" },
  { name: "Senegal", currency: "USD" },
  { name: "Côte d'Ivoire", currency: "USD" },
  { name: "Zambia", currency: "USD" },
  { name: "Zimbabwe", currency: "USD" },
  { name: "Botswana", currency: "USD" },
  { name: "Namibia", currency: "USD" },
  { name: "Sierra Leone", currency: "USD" },
  { name: "Liberia", currency: "USD" },
  { name: "Malawi", currency: "USD" },
  { name: "Mozambique", currency: "USD" },
  { name: "India", currency: "USD" },
  { name: "Pakistan", currency: "USD" },
  { name: "United Arab Emirates", currency: "USD" },
  { name: "Saudi Arabia", currency: "USD" },
  { name: "Germany", currency: "USD" },
  { name: "France", currency: "USD" },
  { name: "Netherlands", currency: "USD" },
  { name: "Ireland", currency: "USD" },
  { name: "Spain", currency: "USD" },
  { name: "Italy", currency: "USD" },
  { name: "Brazil", currency: "USD" },
  { name: "China", currency: "USD" },
  { name: "Other", currency: "USD" },
];

export function getCurrencyForCountry(country: string): string | undefined {
  return countries.find((c) => c.name === country)?.currency;
}
