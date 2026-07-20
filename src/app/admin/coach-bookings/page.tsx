import { requirePermission } from "@/lib/dal";
import { listCoachBookings, cancelCoachBookingAction } from "@/app/actions/coach-booking";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

function formatSessionAt(d: Date) {
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminCoachBookingsPage() {
  await requirePermission("coach_bookings:view");
  const bookings = await listCoachBookings();
  const now = Date.now();

  return (
    <div className="space-y-6">
      <PageHeader title="Coach Bookings" subtitle={`${bookings.length} sessions booked`} />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-2">
          {bookings.map((b) => {
            const past = b.sessionAt.getTime() < now;
            return (
              <div
                key={b.id}
                className={`flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:gap-4 ${
                  past ? "opacity-60" : ""
                }`}
              >
                <Avatar name={b.user.name} accent="navy" size={40} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{b.user.name}</p>
                  <p className="truncate text-xs text-muted">{b.user.email}</p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                  <span>
                    Coach: <span className="font-semibold text-slate-700">{b.coachName}</span>
                  </span>
                  <span>
                    Session:{" "}
                    <span className="font-semibold text-slate-700">{formatSessionAt(b.sessionAt)}</span>
                  </span>
                  <span>Booked {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>

                <ConfirmDeleteButton
                  onDelete={cancelCoachBookingAction.bind(null, b.id)}
                  itemLabel={`the session with ${b.coachName}`}
                />
              </div>
            );
          })}

          {bookings.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No coaching sessions booked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
