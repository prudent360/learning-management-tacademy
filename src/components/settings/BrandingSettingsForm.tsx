"use client";

import { useRef, useState, useTransition } from "react";
import {
  uploadBrandingLogoAction,
  removeBrandingLogoAction,
  type BrandingSlot,
  type BrandingSettingsView,
} from "@/app/actions/settings";
import { ImageIcon, UploadIcon, TrashIcon } from "@/components/icons";

const SLOTS: {
  slot: BrandingSlot;
  field: keyof BrandingSettingsView;
  title: string;
  hint: string;
}[] = [
  { slot: "header", field: "headerLogo", title: "Header Logo", hint: "Shown in the top navigation bar" },
  { slot: "footer", field: "footerLogo", title: "Footer Logo", hint: "Shown in the site footer" },
  { slot: "dashboard", field: "dashboardLogo", title: "Dashboard Logo", hint: "Shown inside the admin sidebar" },
  { slot: "invoice", field: "invoiceLogo", title: "Invoice Logo", hint: "Used on receipts and invoices" },
  { slot: "favicon", field: "faviconLogo", title: "Favicon", hint: "Browser tab icon — square, e.g. 512×512" },
];

export function BrandingSettingsForm({ initial }: { initial: BrandingSettingsView }) {
  const [logos, setLogos] = useState(initial);

  const setField = (field: keyof BrandingSettingsView, value: string | null) => {
    setLogos((l) => ({ ...l, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-1">
        <h2 className="text-sm font-bold text-slate-800">Logo Management</h2>
        <p className="text-xs text-muted">
          Upload logos for different parts of your platform. PNG, JPEG, or WEBP up to 2MB.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SLOTS.map((s) => (
          <LogoSlotCard
            key={s.slot}
            slot={s.slot}
            title={s.title}
            hint={s.hint}
            value={logos[s.field]}
            onChange={(v) => setField(s.field, v)}
          />
        ))}
      </div>
    </div>
  );
}

function LogoSlotCard({
  slot,
  title,
  hint,
  value,
  onChange,
}: {
  slot: BrandingSlot;
  title: string;
  hint: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await uploadBrandingLogoAction(slot, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChange(result.path ?? null);
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeBrandingLogoAction(slot);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChange(null);
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="mt-0.5 text-[10px] text-muted">{hint}</p>
      </div>

      <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic admin-uploaded asset, dimensions unknown
          <img src={value} alt={`${title} preview`} className="max-h-full max-w-full object-contain p-2" />
        ) : (
          <ImageIcon className="h-8 w-8 text-slate-300" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadIcon className="h-4 w-4" />
          {pending ? "Uploading…" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="grid h-8 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
