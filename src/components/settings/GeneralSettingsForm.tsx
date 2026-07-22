"use client";

import { useState, useTransition } from "react";
import { updateGeneralSettings, type GeneralSettingsInput } from "@/app/actions/settings";
import {
  CheckCircleIcon,
  BuildingIcon,
  MailIcon,
  GlobeIcon,
  SettingsIcon,
} from "@/components/icons";

export function GeneralSettingsForm({ initial }: { initial: GeneralSettingsInput }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof GeneralSettingsInput>(k: K, v: GeneralSettingsInput[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateGeneralSettings(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Company Information */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <BuildingIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">Company Information</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Site Name / Company Name
              </label>
              <div className="relative rounded-lg border border-line bg-surface-muted flex items-center focus-within:border-navy-600 focus-within:bg-surface transition-colors">
                <BuildingIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
                <input
                  value={form.siteName}
                  onChange={(e) => set("siteName", e.target.value)}
                  placeholder="e.g. TekSkillUp"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Controls the site name shown in browser title bars, headers, footers, logos, and system emails.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <div className="relative rounded-lg border border-line bg-surface-muted flex items-center focus-within:border-navy-600 focus-within:bg-surface transition-colors">
                <MailIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => set("supportEmail", e.target.value)}
                  placeholder="hello@company.com"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Settings */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <SettingsIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">System Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                System Timezone
              </label>
              <div className="relative rounded-lg border border-line bg-surface-muted flex items-center focus-within:border-navy-600 focus-within:bg-surface transition-colors">
                <GlobeIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
                <input
                  value={form.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                  placeholder="e.g. UTC, Africa/Lagos"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </div>
              <p className="text-[10px] text-muted mt-1">All course schedules and reminders will use this timezone.</p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Maintenance State
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-line/65 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) => set("maintenanceMode", e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-line accent-navy"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-700">Enable Maintenance Mode</span>
                  <p className="text-[10px] text-muted mt-0.5">Restrict student access and display placeholder offline alert.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Actions Banner */}
      <div className="flex items-center justify-between border-t border-line pt-4 bg-surface p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {pending ? "Saving…" : "Save Settings"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
              <CheckCircleIcon className="h-4 w-4" /> Saved Successfully
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
