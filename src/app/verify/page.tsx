"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookIcon, CheckIcon } from "@/components/icons";

export default function PublicVerifyLookupPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) {
      setError("Please enter a credential ID");
      return;
    }
    setError("");
    router.push(`/verify/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <span className="text-xl">🎓</span>
        <span className="text-sm font-bold text-slate-800 tracking-wide uppercase">TekSkillUp Academy</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-xl">
          <div className="text-center">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-navy-50 text-navy mb-4">
              <BookIcon className="h-7 w-7" />
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800">
              Certificate Verification
            </h2>
            <p className="mt-2 text-xs text-muted">
              Verify the authenticity of a TekSkillUp Academy completion credential.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="credId" className="block text-xs font-semibold text-slate-700 mb-1">
                Credential ID
              </label>
              <input
                id="credId"
                name="credId"
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. TSU-4F9A2C"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
              {error && <p className="text-[11px] text-red-500 mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-700 shadow-md"
            >
              Verify Credential
            </button>
          </form>

          <div className="pt-4 text-center border-t border-line">
            <Link
              href="/login"
              className="text-xs text-navy font-semibold hover:underline"
            >
              Return to LMS Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-muted">
        &copy; {new Date().getFullYear()} TekSkillUp Academy. All rights reserved. Public verification system.
      </div>
    </div>
  );
}
