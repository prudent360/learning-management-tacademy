import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { listCoaches } from "@/app/actions/coaches";

export default async function TeamPage() {
  const team = await listCoaches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="The coaches and support staff working alongside you."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {team.map((m) => (
          <div key={m.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <Avatar name={m.name} accent={m.accent} size={52} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{m.name}</p>
                <p className="truncate text-xs font-medium text-orange">{m.role}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-muted">{m.bio}</p>
            <p className="mt-3 text-xs text-muted">
              <span className="font-semibold text-slate-600">Focus:</span> {m.focus}
            </p>
            {m.bookable ? (
              <Link
                href="/book-a-coach"
                className="mt-4 rounded-lg border border-line py-2 text-center text-sm font-semibold text-navy transition-colors hover:bg-navy-50"
              >
                Book a session
              </Link>
            ) : (
              <Link
                href="/contact-support"
                className="mt-4 rounded-lg border border-line py-2 text-center text-sm font-semibold text-navy transition-colors hover:bg-navy-50"
              >
                Contact
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
