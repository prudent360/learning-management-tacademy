"use client";

import { getPasswordStrength } from "@/lib/password-strength";

const BAR_COLORS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-brand-green"];
const LABEL_COLORS = ["text-red-600", "text-red-600", "text-amber-600", "text-blue-600", "text-brand-green"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = getPasswordStrength(password);

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? BAR_COLORS[score] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-[11px] font-semibold ${LABEL_COLORS[score]}`}>{label}</p>
    </div>
  );
}
