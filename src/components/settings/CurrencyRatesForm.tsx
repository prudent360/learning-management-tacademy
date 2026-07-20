"use client";

import { useState, useTransition } from "react";
import { updateCurrencyRates, type CurrencyRateRow } from "@/app/actions/settings";
import { formatCurrency } from "@/lib/currency";
import { GlobeIcon, CheckCircleIcon } from "@/components/icons";

export function CurrencyRatesForm({
  baseCurrency,
  initialRates,
}: {
  baseCurrency: string;
  initialRates: CurrencyRateRow[];
}) {
  const [rates, setRates] = useState(initialRates);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (code: string, value: string) => {
    setSaved(false);
    setRates((prev) =>
      prev.map((r) => (r.code === code ? { ...r, rate: value === "" ? null : Number(value) } : r)),
    );
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateCurrencyRates(
        rates.map((r) => ({ code: r.code, rate: r.rate })),
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <GlobeIcon className="h-5 w-5 text-navy" />
        <h2 className="text-sm font-bold text-slate-800">Currency Conversion Rates</h2>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Course prices are charged in <strong>{baseCurrency}</strong> — that never changes. These
        rates only power a <strong>display-only</strong> local-currency estimate shown to students
        whose profile country uses a different currency (e.g. "≈ $16.50" next to a{" "}
        {baseCurrency} price). Enter how many {baseCurrency} equal 1 unit of each currency below;
        leave a field blank to hide the estimate for that currency.
      </p>

      <div className="space-y-3">
        {rates.map((r) => (
          <div key={r.code} className="flex items-center gap-3">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-slate-700">{r.code}</p>
              <p className="text-[11px] text-muted">{r.label}</p>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <span className="text-xs text-muted whitespace-nowrap">1 {r.code} =</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Not set"
                value={r.rate ?? ""}
                onChange={(e) => set(r.code, e.target.value)}
                className="w-32 rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm outline-none focus:border-navy-600"
              />
              <span className="text-xs text-muted whitespace-nowrap">{baseCurrency}</span>
              {r.rate && (
                <span className="text-[11px] text-muted whitespace-nowrap">
                  e.g. {formatCurrency(1000, baseCurrency)} ≈{" "}
                  {formatCurrency(Math.round((1000 / r.rate) * 100) / 100, r.code)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save rates"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-green">
            <CheckCircleIcon className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
