import type { MyAttendanceSummary } from "@/app/actions/attendance";

const statusStyle: Record<string, string> = {
  PRESENT: "bg-brand-green text-white",
  LATE: "bg-amber-500 text-white",
  ABSENT: "bg-red-500 text-white",
};

const statusLabel: Record<string, string> = {
  PRESENT: "P",
  LATE: "L",
  ABSENT: "A",
};

export function AttendanceSummary({ attendance }: { attendance: MyAttendanceSummary }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center justify-between px-2 py-2">
        <p className="text-sm font-bold text-slate-800">Attendance</p>
        <p className="text-lg font-extrabold text-navy">{attendance.percent}%</p>
      </div>

      <div className="flex items-center justify-between px-2 pb-3 text-xs text-muted">
        <span>{attendance.presentCount} present</span>
        <span>{attendance.lateCount} late</span>
        <span>{attendance.absentCount} absent</span>
      </div>

      <div className="flex flex-wrap gap-1.5 px-2 pb-2">
        {attendance.history.map((h) => (
          <span
            key={h.date.toString()}
            title={new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${statusStyle[h.status]}`}
          >
            {statusLabel[h.status]}
          </span>
        ))}
      </div>
    </div>
  );
}
