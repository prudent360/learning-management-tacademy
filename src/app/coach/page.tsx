import { getMyCoachBookings } from "@/app/actions/coaches";
import { Avatar } from "@/components/Avatar";
import { CalendarIcon } from "@/components/icons";

function formatSessionAt(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function CoachBookingsPage() {
  const bookings = await getMyCoachBookings();
  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.sessionAt).getTime() >= now);
  const past = bookings.filter((b) => new Date(b.sessionAt).getTime() < now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-800">My Bookings</h1>
        <p className="text-sm text-muted">Students who've booked a session with you.</p>
      </div>

      <Section title="Upcoming" bookings={upcoming} emptyText="No upcoming sessions." />
      <Section title="Past" bookings={past} emptyText="No past sessions yet." />
    </div>
  );
}

function Section({
  title,
  bookings,
  emptyText,
}: {
  title: string;
  bookings: Awaited<ReturnType<typeof getMyCoachBookings>>;
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <h2 className="mb-4 text-sm font-bold text-slate-800">{title}</h2>
      {bookings.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-xl bg-surface-muted p-4"
            >
              <Avatar name={b.studentName} accent="navy" size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{b.studentName}</p>
                <p className="truncate text-xs text-muted">{b.studentEmail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-navy-600">
                <CalendarIcon className="h-4 w-4" />
                {formatSessionAt(new Date(b.sessionAt))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
