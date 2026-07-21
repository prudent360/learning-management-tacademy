"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import type { CoachRecord } from "@/app/actions/coaches";
import {
  bookCoachSessionAction,
  getAvailableSlotsAction,
  type AvailableSlot,
} from "@/app/actions/coach-booking";
import { CheckCircleIcon, CalendarIcon } from "@/components/icons";
import { refreshNotifications } from "@/lib/useNotifications";

export function BookACoachView({ coaches }: { coaches: CoachRecord[] }) {
  if (coaches.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Book A Coach"
          subtitle="Schedule a one-to-one session with a member of your team."
        />
        <div className="rounded-2xl bg-surface p-8 text-center text-sm text-muted">
          No coaches are available for booking right now — check back soon.
        </div>
      </div>
    );
  }

  return <BookACoachForm coaches={coaches} />;
}

function BookACoachForm({ coaches }: { coaches: CoachRecord[] }) {
  const [coachId, setCoachId] = useState(coaches[0].id);
  const [slots, setSlots] = useState<AvailableSlot[] | null>(null);
  const [sessionAt, setSessionAt] = useState<string | null>(null);
  const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSlots(null);
    setSessionAt(null);
    getAvailableSlotsAction(coachId).then(setSlots);
  }, [coachId]);

  const selectCoach = (id: string) => {
    setCoachId(id);
    setConfirmedLabel(null);
    setError(null);
  };

  const confirmBooking = () => {
    if (!sessionAt) return;
    setError(null);
    startTransition(async () => {
      const result = await bookCoachSessionAction(coachId, sessionAt);
      if (!result.success) {
        setError(result.error);
        // The slot may have just been taken by someone else — refresh availability.
        getAvailableSlotsAction(coachId).then(setSlots);
        setSessionAt(null);
        return;
      }
      setEmailSent(result.emailSent);
      setConfirmedLabel(result.label);
      refreshNotifications();
    });
  };

  const selected = coaches.find((c) => c.id === coachId)!;
  const selectedSlot = slots?.find((s) => s.sessionAt === sessionAt);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book A Coach"
        subtitle="Schedule a one-to-one session with a member of your team."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Coach list */}
        <div className="rounded-2xl bg-surface p-5 md:p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Choose a coach</h2>
          <div className="space-y-3">
            {coaches.map((c) => {
              const active = c.id === coachId;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCoach(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    active ? "border-navy-600 bg-navy-50" : "border-line hover:bg-surface-muted"
                  }`}
                >
                  <Avatar name={c.name} accent={c.accent} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="truncate text-xs font-medium text-orange">{c.role}</p>
                    <p className="truncate text-xs text-muted">{c.focus}</p>
                  </div>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                      active ? "border-navy-600 bg-navy-600" : "border-slate-300"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking panel */}
        <div className="rounded-2xl bg-surface p-5 md:p-6 lg:sticky lg:top-24 lg:self-start">
          {confirmedLabel ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-brand-green">
                <CheckCircleIcon className="h-8 w-8" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-800">Session booked!</h3>
              <p className="mt-1 text-sm text-muted">
                You&apos;re booked with <span className="font-semibold text-slate-700">{selected.name}</span> for{" "}
                <span className="font-semibold text-slate-700">{confirmedLabel}</span>.{" "}
                {emailSent
                  ? "A confirmation email is on its way."
                  : "We couldn't send a confirmation email, but your session is booked."}
              </p>
              <button
                onClick={() => {
                  setConfirmedLabel(null);
                  setSessionAt(null);
                  getAvailableSlotsAction(coachId).then(setSlots);
                }}
                className="mt-5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy-50"
              >
                Book another
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Avatar name={selected.name} accent={selected.accent} size={44} />
                <div>
                  <p className="text-sm font-bold text-slate-800">{selected.name}</p>
                  <p className="text-xs text-muted">{selected.role}</p>
                </div>
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CalendarIcon className="h-4 w-4 text-navy" />
                Pick an upcoming time
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {slots === null && (
                  <p className="col-span-2 py-4 text-center text-sm text-muted">Loading availability…</p>
                )}
                {slots?.length === 0 && (
                  <p className="col-span-2 py-4 text-center text-sm text-muted">
                    No upcoming slots — check back soon.
                  </p>
                )}
                {slots?.map((s) => {
                  const active = s.sessionAt === sessionAt;
                  return (
                    <button
                      key={s.sessionAt}
                      onClick={() => s.available && setSessionAt(s.sessionAt)}
                      disabled={!s.available}
                      title={s.available ? undefined : "Already booked"}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                        !s.available
                          ? "cursor-not-allowed border-line bg-surface-muted text-slate-300 line-through"
                          : active
                            ? "border-navy-600 bg-navy text-white"
                            : "border-line text-slate-700 hover:bg-navy-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={confirmBooking}
                disabled={!sessionAt || pending}
                className="mt-5 w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? "Booking…" : selectedSlot ? `Confirm ${selectedSlot.label}` : "Select a time"}
              </button>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
