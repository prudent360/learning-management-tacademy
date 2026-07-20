import { requirePermission } from "@/lib/dal";
import { listCoaches, deleteCoachAction } from "@/app/actions/coaches";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { CoachFormModal } from "@/components/CoachFormModal";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export default async function AdminCoachesPage() {
  await requirePermission("coaches:view");
  const coaches = await listCoaches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coaches"
        subtitle={`${coaches.length} coaches`}
        action={<CoachFormModal />}
      />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-2">
          {coaches.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <Avatar name={c.name} accent={c.accent} size={44} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-slate-800">{c.name}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      c.bookable ? "bg-green-100 text-brand-green" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.bookable ? "Bookable" : "Not bookable"}
                  </span>
                </div>
                <p className="truncate text-xs font-medium text-orange">{c.role}</p>
                <p className="truncate text-xs text-muted">{c.focus}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <CoachFormModal coach={c} />
                <ConfirmDeleteButton onDelete={deleteCoachAction.bind(null, c.id)} itemLabel={c.name} />
              </div>
            </div>
          ))}

          {coaches.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No coaches yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
