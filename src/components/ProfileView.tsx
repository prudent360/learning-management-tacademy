"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  updateProfile,
  changePassword,
  type ProfileData,
} from "@/app/actions/profile";
import { countries } from "@/lib/countries";
import { UserIcon, MailIcon, GlobeIcon, LockIcon, CheckCircleIcon } from "@/components/icons";

const cardClass = "rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4";
const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500";
const inputWrapClass =
  "relative flex items-center rounded-lg border border-line bg-surface-muted transition-colors focus-within:border-navy-600 focus-within:bg-surface";
const inputClass = "w-full bg-transparent px-3 py-2.5 text-sm outline-none";

export function ProfileView({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwPending, startPwTransition] = useTransition();

  const handleSave = () => {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await updateProfile(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  const handlePasswordSave = () => {
    setPwSaved(false);
    setPwError(null);
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError("New passwords don't match.");
      return;
    }
    startPwTransition(async () => {
      const result = await changePassword(pw);
      if (!result.success) {
        setPwError(result.error);
        return;
      }
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwSaved(true);
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account details and security." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal details */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <UserIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">Personal Details</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Full name</label>
              <div className={inputWrapClass}>
                <UserIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                <input
                  value={form.name}
                  onChange={(e) => {
                    setSaved(false);
                    setForm((f) => ({ ...f, name: e.target.value }));
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <div className={inputWrapClass}>
                <MailIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setSaved(false);
                    setForm((f) => ({ ...f, email: e.target.value }));
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <div className={inputWrapClass}>
                <GlobeIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                <select
                  value={form.country ?? ""}
                  onChange={(e) => {
                    setSaved(false);
                    setForm((f) => ({ ...f, country: e.target.value || null }));
                  }}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select your country…</option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                Determines the local-currency price estimate shown alongside course prices.
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={pending}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-green">
                <CheckCircleIcon className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </div>

        {/* Password */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <LockIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">Change Password</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Current password</label>
              <div className={inputWrapClass}>
                <LockIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                <input
                  type="password"
                  value={pw.currentPassword}
                  onChange={(e) => {
                    setPwSaved(false);
                    setPw((f) => ({ ...f, currentPassword: e.target.value }));
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>New password</label>
              <div className={inputWrapClass}>
                <LockIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                <input
                  type="password"
                  value={pw.newPassword}
                  onChange={(e) => {
                    setPwSaved(false);
                    setPw((f) => ({ ...f, newPassword: e.target.value }));
                  }}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm new password</label>
              <div className={inputWrapClass}>
                <LockIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                <input
                  type="password"
                  value={pw.confirmPassword}
                  onChange={(e) => {
                    setPwSaved(false);
                    setPw((f) => ({ ...f, confirmPassword: e.target.value }));
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {pwError && <p className="text-xs text-red-600">{pwError}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handlePasswordSave}
              disabled={
                pwPending || !pw.currentPassword || !pw.newPassword || !pw.confirmPassword
              }
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
            >
              {pwPending ? "Updating…" : "Update password"}
            </button>
            {pwSaved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-green">
                <CheckCircleIcon className="h-4 w-4" /> Updated
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
