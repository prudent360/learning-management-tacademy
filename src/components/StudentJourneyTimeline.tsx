import type { JourneySummary } from "@/app/actions/journey";
import { CheckIcon } from "@/components/icons";

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function StudentJourneyTimeline({ journey }: { journey: JourneySummary }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="px-2 py-2">
        <p className="text-sm font-bold text-slate-800">Your Journey</p>
        <p className="text-xs text-muted">{journey.cohortName}</p>
      </div>

      <ol className="space-y-0.5 px-2 pb-1">
        {journey.stages.map((stage, i) => {
          const isLast = i === journey.stages.length - 1;
          const dateLabel = formatDate(stage.date);
          return (
            <li key={stage.key} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[11px] top-6 h-full w-0.5 ${
                    stage.status === "complete" ? "bg-brand-green/40" : "bg-line"
                  }`}
                />
              )}
              <span
                className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                  stage.status === "complete"
                    ? "bg-brand-green text-white"
                    : stage.status === "current"
                      ? "bg-orange text-white ring-4 ring-orange/20"
                      : "bg-surface-muted text-muted ring-1 ring-inset ring-line"
                }`}
              >
                {stage.status === "complete" ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-xs font-semibold ${
                    stage.status === "upcoming" ? "text-muted" : "text-slate-800"
                  }`}
                >
                  {stage.label}
                  {stage.status === "current" && (
                    <span className="ml-1.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-600">
                      Now
                    </span>
                  )}
                </p>
                {dateLabel && <p className="text-[11px] text-muted">{dateLabel}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
