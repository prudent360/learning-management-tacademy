import { weeklySlotTemplates } from "@/lib/team";

export type UpcomingSlot = { sessionAt: string; label: string };

function formatSlotLabel(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${weekday}, ${month} ${d.getDate()} · ${time}`;
}

/** Projects the weekly recurring templates onto real calendar dates over the next `daysAhead` days. */
export function getUpcomingSlots(daysAhead = 14): UpcomingSlot[] {
  const now = new Date();
  const results: UpcomingSlot[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const weekday = date.getDay();

    for (const tpl of weeklySlotTemplates) {
      if (tpl.weekday !== weekday) continue;
      const [hour, minute] = tpl.time.split(":").map(Number);
      const sessionAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
      if (sessionAt.getTime() <= now.getTime()) continue;
      results.push({ sessionAt: sessionAt.toISOString(), label: formatSlotLabel(sessionAt) });
    }
  }

  results.sort((a, b) => a.sessionAt.localeCompare(b.sessionAt));
  return results;
}
