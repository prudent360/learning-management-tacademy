import type { ComponentType, SVGProps } from "react";

const ACCENT_CLASSES = {
  navy: "bg-navy-50 text-navy",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-100 text-brand-green",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
} as const;

export type StatCardAccent = keyof typeof ACCENT_CLASSES;

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  accent: StatCardAccent;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5">
      <Icon
        className={`pointer-events-none absolute -right-3 -top-3 h-24 w-24 opacity-[0.06] ${ACCENT_CLASSES[accent].split(" ")[1]}`}
      />
      <div className="relative flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${ACCENT_CLASSES[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold text-slate-800">{value}</p>
          <p className="truncate text-xs font-medium text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
