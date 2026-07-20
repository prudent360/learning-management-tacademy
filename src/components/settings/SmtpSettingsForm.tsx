"use client";

import { useState, useTransition } from "react";
import { updateSmtpSettings, type SmtpSettingsView } from "@/app/actions/settings";
import {
  CheckCircleIcon,
  MailIcon,
  GlobeIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/icons";

export function SmtpSettingsForm({ initial }: { initial: SmtpSettingsView }) {
  const [host, setHost] = useState(initial.host);
  const [port, setPort] = useState(initial.port);
  const [username, setUsername] = useState(initial.username);
  const [fromName, setFromName] = useState(initial.fromName);
  const [fromEmail, setFromEmail] = useState(initial.fromEmail);
  const [secure, setSecure] = useState(initial.secure);
  const [password, setPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(initial.hasPassword);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const touch = () => setSaved(false);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateSmtpSettings({
        host,
        port,
        username,
        fromName,
        fromEmail,
        secure,
        password: password || undefined,
        clearPassword,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setHasPassword(clearPassword ? false : password ? true : hasPassword);
      setPassword("");
      setClearPassword(false);
      setSaved(true);
    });
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: SMTP Server Settings */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <GlobeIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">SMTP Connection</h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Outgoing Host
                </label>
                <div className="relative rounded-lg border border-line bg-surface flex items-center focus-within:border-navy-600 transition-colors">
                  <GlobeIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
                  <input
                    value={host}
                    onChange={(e) => {
                      touch();
                      setHost(e.target.value);
                    }}
                    placeholder="smtp.example.com"
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Port
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => {
                    touch();
                    setPort(Number(e.target.value));
                  }}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Security Protocol
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-line/65 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={secure}
                  onChange={(e) => {
                    touch();
                    setSecure(e.target.checked);
                  }}
                  className="h-4.5 w-4.5 rounded border-line accent-navy"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-700">Use TLS/SSL Encryption</span>
                  <p className="text-[10px] text-muted mt-0.5">Encrypts the mail transfer connection for safety.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Credentials */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <SettingsIcon className="h-5 w-5 text-navy" />
            <h2 className="text-sm font-bold text-slate-800">Authentication</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Username
              </label>
              <div className="relative rounded-lg border border-line bg-surface flex items-center focus-within:border-navy-600 transition-colors">
                <MailIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
                <input
                  value={username}
                  onChange={(e) => {
                    touch();
                    setUsername(e.target.value);
                  }}
                  placeholder="e.g. key-api, user@example.com"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <SecretField
              label="Password"
              value={password}
              onChange={(v) => {
                touch();
                setPassword(v);
              }}
              hasExisting={hasPassword}
              clear={clearPassword}
              onClearChange={(v) => {
                touch();
                setClearPassword(v);
              }}
            />
          </div>
        </div>
      </div>

      {/* Sender Profile card */}
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-line">
          <UserIcon className="h-5 w-5 text-navy" />
          <h2 className="text-sm font-bold text-slate-800">Sender Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Sender Name
            </label>
            <div className="relative rounded-lg border border-line bg-surface flex items-center focus-within:border-navy-600 transition-colors">
              <UserIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
              <input
                value={fromName}
                onChange={(e) => {
                  touch();
                  setFromName(e.target.value);
                }}
                placeholder="TekSkillUp Notifications"
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Sender Email Address
            </label>
            <div className="relative rounded-lg border border-line bg-surface flex items-center focus-within:border-navy-600 transition-colors">
              <MailIcon className="h-4.5 w-4.5 text-slate-400 ml-3 shrink-0" />
              <input
                value={fromEmail}
                onChange={(e) => {
                  touch();
                  setFromEmail(e.target.value);
                }}
                placeholder="noreply@example.com"
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
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
            {pending ? "Saving…" : "Save Configuration"}
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

function SecretField({
  label,
  value,
  onChange,
  hasExisting,
  clear,
  onClearChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hasExisting: boolean;
  clear: boolean;
  onClearChange: (v: boolean) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </label>
        {hasExisting && !clear && (
          <span className="rounded bg-brand-green/10 text-brand-green text-[9px] font-bold px-1 py-0.2 shrink-0 uppercase tracking-wide">
            Configured
          </span>
        )}
      </div>

      <div className="relative rounded-lg border border-line bg-surface flex items-center focus-within:border-navy-600 transition-colors">
        <input
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
