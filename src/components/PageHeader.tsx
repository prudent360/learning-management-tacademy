import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-navy px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div>
        <h1 className="text-base font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
