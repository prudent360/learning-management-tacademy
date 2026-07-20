const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
};

/** Every currency code the app can display/convert. Order matters for admin UI listing. */
export const SUPPORTED_CURRENCIES = ["NGN", "USD", "GBP", "GHS", "KES", "ZAR"] as const;

export const CURRENCY_LABELS: Record<string, string> = {
  NGN: "Nigerian Naira",
  USD: "US Dollar",
  GBP: "British Pound",
  GHS: "Ghanaian Cedi",
  KES: "Kenyan Shilling",
  ZAR: "South African Rand",
};

export function formatCurrency(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${sym}${amount.toLocaleString()}`;
}

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || `${currency} `;
}

/**
 * Converts a base-currency amount into a display-only estimate in another
 * currency, using an admin-set rate (base-currency units per 1 unit of the
 * target currency). Returns null when no conversion applies — same currency
 * or no rate configured — so callers can fall back to showing just the base
 * price instead of a broken/zero estimate.
 */
export function convertDisplayPrice(
  baseAmount: number,
  baseCurrency: string,
  targetCurrency: string | null | undefined,
  rate: number | null | undefined,
): number | null {
  if (!targetCurrency || targetCurrency === baseCurrency) return null;
  if (!rate || rate <= 0) return null;
  return Math.round((baseAmount / rate) * 100) / 100;
}
