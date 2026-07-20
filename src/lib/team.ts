export type SlotTemplate = { weekday: number; time: string };

/** Weekly recurring availability template. `weekday` follows Date.getDay() (0=Sun..6=Sat). */
export const weeklySlotTemplates: SlotTemplate[] = [
  { weekday: 1, time: "10:00" },
  { weekday: 1, time: "14:00" },
  { weekday: 2, time: "11:30" },
  { weekday: 3, time: "09:00" },
  { weekday: 3, time: "16:00" },
  { weekday: 4, time: "13:00" },
  { weekday: 5, time: "10:30" },
];
