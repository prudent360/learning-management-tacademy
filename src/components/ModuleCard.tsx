import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { CalendarIcon } from "@/components/icons";

export type Module = {
  title: string;
  status: string;
  progress: number;
  meta: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** When set, the card links to this course's player. */
  courseSlug?: string;
};

export function ModuleCard({
  module,
  active,
  href,
}: {
  module: Module;
  active?: boolean;
  href?: string;
}) {
  const Icon = module.icon;

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-4 transition-shadow hover:shadow-md ${
        active
          ? "border-transparent bg-navy text-white"
          : "border-line bg-surface text-slate-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
            active ? "bg-white/15 text-white" : "bg-navy-50 text-navy"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{module.title}</p>
          <p className={`text-xs ${active ? "text-white/70" : "text-muted"}`}>
            {module.status}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-1.5 flex-1 overflow-hidden rounded-full ${
              active ? "bg-white/25" : "bg-slate-100"
            }`}
          >
            <div
              className={`h-full rounded-full ${active ? "bg-white" : "bg-navy-600"}`}
              style={{ width: `${module.progress}%` }}
            />
          </div>
          <span className={`text-xs font-semibold ${active ? "text-white" : "text-navy-600"}`}>
            {module.progress}%
          </span>
        </div>

        <div
          className={`mt-3 flex items-center justify-between text-xs ${
            active ? "text-white/70" : "text-muted"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            {module.meta}
          </span>
          {href ? (
            <Link href={href} className={`font-semibold ${active ? "text-white" : "text-orange"}`}>
              View Details
            </Link>
          ) : (
            <button className={`font-semibold ${active ? "text-white" : "text-orange"}`}>
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
