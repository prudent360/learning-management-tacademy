"use client";

import type { PaymentRow } from "@/app/actions/admin-payments";
import { DownloadIcon } from "@/components/icons";

export function PaymentsExportButton({ payments }: { payments: PaymentRow[] }) {
  const exportCSV = () => {
    const headers = [
      "Date",
      "User",
      "Email",
      "Course",
      "Amount",
      "Currency",
      "Provider",
      "Reference",
      "Status",
    ];
    const rows = payments.map((p) => [
      new Date(p.createdAt).toLocaleString(),
      p.userName,
      p.userEmail,
      p.courseTitle,
      p.amount,
      p.currency,
      p.provider,
      p.providerRef,
      p.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `payments_${new Date().toISOString().split("T")[0]}.csv`);
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
