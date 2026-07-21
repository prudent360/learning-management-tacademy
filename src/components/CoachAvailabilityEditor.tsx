"use client";

import { useState, useTransition } from "react";
import { setMyCoachAvailability, type AvailabilitySlot } from "@/app/actions/coaches";
import { PlusIcon, CloseIcon } from "@/components/icons";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function slotKey(s: AvailabilitySlot) {
  return `${s.weekday}-${s.time}`;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function CoachAvailabilityEditor({ initialSlots }: { initialSlots: AvailabilitySlot[] }) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [weekday, setWeekday] = useState(1);
  const [time, setTime] = useState("10:00");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const addSlot = () => {
    setSaved(false);
    if (slots.some((s) => s.weekday === weekday && s.time === time)) return;
    setSlots((prev) => [...prev, { weekday, time }].sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time)));
  };

  const removeSlot = (s: AvailabilitySlot) => {
    setSaved(false);
    setSlots((prev) => prev.filter((x) => slotKey(x) !== slotKey(s)));
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await setMyCoachAvailability(slots);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  };

  const byWeekday = WEEKDAYS.map((label, idx) => ({
    label,
    idx,
    slots: slots.filter((s) => s.weekday === idx),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">Add a weekly slot</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Day</label>
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy-600"
            >
              {WEEKDAYS.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy-600"
            />
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add slot
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-sm font-bold text-slate-800">Your weekly schedule</h2>
        {slots.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No availability set yet — add slots above so students can book you.
          </p>
        ) : (
          <div className="space-y-4">
            {byWeekday
              .filter((d) => d.slots.length > 0)
              .map((d) => (
                <div key={d.idx}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{d.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {d.slots.map((s) => (
                      <span
                        key={slotKey(s)}
                        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-muted px-3 py-1.5 text-sm text-slate-700"
                      >
                        {formatTime(s.time)}
                        <button
                          type="button"
                          onClick={() => removeSlot(s)}
                          aria-label={`Remove ${d.label} ${formatTime(s.time)}`}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSave}
          disabled={pending}
          className="mt-5 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save Availability"}
        </button>
      </div>
    </div>
  );
}
