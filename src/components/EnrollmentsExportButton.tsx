"use client";

import type { EnrollmentRow } from "@/app/actions/enrollments";
import { DownloadIcon } from "@/components/icons";

export function EnrollmentsExportButton({ enrollments }: { enrollments: EnrollmentRow[] }) {
  const exportCSV = () => {
    const headers = ["Student", "Email", "Course", "Source", "Provider", "Enrolled"];
    const rows = enrollments.map((e) => [
      e.userName,
      e.userEmail,
      e.courseTitle,
      e.source,
      e.paymentProvider ?? "",
      new Date(e.enrolledAt).toLocaleString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `enrollments_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportCSV}
      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
    >
      <DownloadIcon className="h-4 w-4" />
      Export CSV
    </button>
  );
}
