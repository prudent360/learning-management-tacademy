"use client";

import { useState, useTransition } from "react";
import {
  updateOrderCurrency,
  updatePaymentGateway,
  type GatewayView,
  type OrderCurrencyInput,
} from "@/app/actions/settings";
import { GATEWAY_LABELS, type GatewayId } from "@/lib/payment-gateways";
import { CheckCircleIcon, CreditCardIcon, GlobeIcon } from "@/components/icons";

export function PaymentGatewaySettings({
  currency,
  gateways,
}: {
  currency: OrderCurrencyInput;
  gateways: GatewayView[];
}) {
  return (
    <div className="space-y-6">
      <OrderCurrencyCard initial={currency} />
      {gateways.map((g) => (
        <GatewayCard key={g.id} initial={g} />
      ))}
    </div>
  );
}

function OrderCurrencyCard({ initial }: { initial: OrderCurrencyInput }) {
  const [currency, setCurrency] = useState(initial.currency);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderCurrency({ currency });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-line">
        <GlobeIcon className="h-5 w-5 text-navy" />
        <h2 className="text-sm font-bold text-slate-800">Order Currency</h2>
      </div>
      <p className="text-xs text-muted">
        The currency every course price is denominated in. A gateway is only offered at checkout
        when this currency is in its supported list below.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Currency
          </label>
          <input
            value={currency}
            onChange={(e) => {
              setSaved(false);
              setCurrency(e.target.value.toUpperCase());
            }}
            maxLength={3}
            placeholder="NGN"
            className="w-28 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm uppercase outline-none focus:border-navy-600"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-navy px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
            <CheckCircleIcon className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function GatewayCard({ initial }: { initial: GatewayView }) {
  const gatewayId: GatewayId = initial.id;
  const isFincra = gatewayId === "fincra";

  const [enabled, setEnabled] = useState(initial.enabled);
  const [mode, setMode] = useState<"test" | "live">(initial.mode);
  const [currencies, setCurrencies] = useState(initial.currencies.join(","));

  const [testPublicKey, setTestPublicKey] = useState(initial.testPublicKey);
  const [testSecretKey, setTestSecretKey] = useState("");
  const [clearTestSecretKey, setClearTestSecretKey] = useState(false);
  const [hasTestSecretKey, setHasTestSecretKey] = useState(initial.hasTestSecretKey);

  const [livePublicKey, setLivePublicKey] = useState(initial.livePublicKey);
  const [liveSecretKey, setLiveSecretKey] = useState("");
  const [clearLiveSecretKey, setClearLiveSecretKey] = useState(false);
  const [hasLiveSecretKey, setHasLiveSecretKey] = useState(initial.hasLiveSecretKey);

  const [webhookSecret, setWebhookSecret] = useState("");
  const [clearWebhookSecret, setClearWebhookSecret] = useState(false);
  const [hasWebhookSecret, setHasWebhookSecret] = useState(initial.hasWebhookSecret);

  const [encryptionKey, setEncryptionKey] = useState("");
  const [clearEncryptionKey, setClearEncryptionKey] = useState(false);
  const [hasEncryptionKey, setHasEncryptionKey] = useState(initial.hasEncryptionKey);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const touch = () => setSaved(false);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updatePaymentGateway({
        id: gatewayId,
        enabled,
        mode,
        currencies: currencies
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        testPublicKey,
        testSecretKey: testSecretKey || undefined,
        clearTestSecretKey,
        livePublicKey,
        liveSecretKey: liveSecretKey || undefined,
        clearLiveSecretKey,
        webhookSecret: webhookSecret || undefined,
        clearWebhookSecret,
        encryptionKey: encryptionKey || undefined,
        clearEncryptionKey,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setHasTestSecretKey(clearTestSecretKey ? false : testSecretKey ? true : hasTestSecretKey);
      setHasLiveSecretKey(clearLiveSecretKey ? false : liveSecretKey ? true : hasLiveSecretKey);
      setHasWebhookSecret(clearWebhookSecret ? false : webhookSecret ? true : hasWebhookSecret);
      setHasEncryptionKey(clearEncryptionKey ? false : encryptionKey ? true : hasEncryptionKey);
      setTestSecretKey("");
      setLiveSecretKey("");
      setWebhookSecret("");
      setEncryptionKey("");
      setClearTestSecretKey(false);
      setClearLiveSecretKey(false);
      setClearWebhookSecret(false);
      setClearEncryptionKey(false);
      setSaved(true);
    });
  };

  return (
    <div data-gateway={gatewayId} className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-navy" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">{GATEWAY_LABELS[gatewayId]}</h2>
            <p className="text-xs text-muted">
              {enabled ? "Enabled" : "Disabled"} · {mode} mode
            </p>
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => {
              touch();
              setEnabled(e.target.checked);
            }}
            className="peer sr-only"
          />
          <span className="h-7 w-12 rounded-full bg-slate-200 transition-colors peer-checked:bg-navy" />
          <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Mode
        </label>
        <select
          value={mode}
          onChange={(e) => {
            touch();
            setMode(e.target.value as "test" | "live");
          }}
          className="w-full max-w-xs rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
        >
          <option value="test">Test</option>
          <option value="live">Live</option>
        </select>
        <p className="mt-1 text-[10px] text-muted">Switches which key pair is used at checkout.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          name="testPublicKey"
          label="Test public key (pk_test_…)"
          value={testPublicKey}
          onChange={(v) => {
            touch();
            setTestPublicKey(v);
          }}
        />
        <SecretField
          name="testSecretKey"
          label="Test secret key (sk_test_…)"
          value={testSecretKey}
          onChange={(v) => {
            touch();
            setTestSecretKey(v);
          }}
          hasExisting={hasTestSecretKey}
          clear={clearTestSecretKey}
          onClearChange={(v) => {
            touch();
            setClearTestSecretKey(v);
          }}
        />
        <TextField
          name="livePublicKey"
          label="Live public key (pk_live_…)"
          value={livePublicKey}
          onChange={(v) => {
            touch();
            setLivePublicKey(v);
          }}
        />
        <SecretField
          name="liveSecretKey"
          label="Live secret key (sk_live_…)"
          value={liveSecretKey}
          onChange={(v) => {
            touch();
            setLiveSecretKey(v);
          }}
          hasExisting={hasLiveSecretKey}
          clear={clearLiveSecretKey}
          onClearChange={(v) => {
            touch();
            setClearLiveSecretKey(v);
          }}
        />
      </div>

      <div>
        <SecretField
          name="webhookSecret"
          label={isFincra ? "Webhook secret" : "Webhook secret (not required)"}
          value={webhookSecret}
          onChange={(v) => {
            touch();
            setWebhookSecret(v);
          }}
          hasExisting={hasWebhookSecret}
          clear={clearWebhookSecret}
          onClearChange={(v) => {
            touch();
            setClearWebhookSecret(v);
          }}
        />
        <p className="mt-1 text-[10px] text-muted">
          {isFincra
            ? `Find this under Fincra Dashboard → Settings → Webhooks. Point it to /api/webhooks/fincra.`
            : `Paystack verifies webhooks with your secret key — no separate secret needed. Point your Paystack dashboard webhook to /api/webhooks/paystack.`}
        </p>
      </div>

      {isFincra && (
        <SecretField
          name="encryptionKey"
          label="Encryption key"
          value={encryptionKey}
          onChange={(v) => {
            touch();
            setEncryptionKey(v);
          }}
          hasExisting={hasEncryptionKey}
          clear={clearEncryptionKey}
          onClearChange={(v) => {
            touch();
            setClearEncryptionKey(v);
          }}
        />
      )}

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Supported currencies
        </label>
        <input
          name="currencies"
          value={currencies}
          onChange={(e) => {
            touch();
            setCurrencies(e.target.value.toUpperCase());
          }}
          placeholder="NGN, GHS"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm uppercase outline-none focus:border-navy-600"
        />
        <p className="mt-1 text-[10px] text-muted">
          Comma-separated ISO codes this gateway can charge (e.g. NGN, GHS). {GATEWAY_LABELS[gatewayId]} is
          only offered at checkout when the order currency is in this list. Defaults to the order
          currency if left blank.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
              <CheckCircleIcon className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  name,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
      />
    </div>
  );
}

function SecretField({
  label,
  value,
  onChange,
  hasExisting,
  clear,
  onClearChange,
  name,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hasExisting: boolean;
  clear: boolean;
  onClearChange: (v: boolean) => void;
  name?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
        {hasExisting && !clear && (
          <span className="rounded bg-brand-green/10 text-brand-green text-[9px] font-bold px-1 py-0.2 shrink-0 uppercase tracking-wide">
            Configured
          </span>
        )}
      </div>

      <div className="relative rounded-lg border border-line bg-surface flex items-center focus-within:border-navy-600 transition-colors">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={clear}
          placeholder={hasExisting ? "•••••••• (unchanged)" : "Not set"}
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="text-slate-400 hover:text-slate-600 pr-3 shrink-0 text-xs font-bold"
          >
            {show ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>

      {hasExisting && (
        <label className="mt-1.5 flex items-center gap-2 text-[10px] text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={clear}
            onChange={(e) => onClearChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line accent-red-600"
          />
          Clear saved {label.toLowerCase()}
        </label>
      )}
    </div>
  );
}
