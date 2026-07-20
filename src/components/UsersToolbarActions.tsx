"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkImportUsersAction, type BulkImportResult } from "@/app/actions/admin";
import { AddUserModal } from "@/components/AddUserModal";
import { DownloadIcon, UploadIcon } from "@/components/icons";

type ExportRow = {
  name: string;
  email: string;
  role: string;
  category: string;
  createdAt: string | Date;
};

/** Minimal CSV parser: handles quoted fields with embedded commas/newlines. */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export function UsersToolbarActions({ users }: { users: ExportRow[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Category", "Joined"];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.role,
      u.category,
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `users_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    setImportError(null);
    setImportResult(null);
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const table = parseCSV(text);
      if (table.length < 2) {
        setImportError("The CSV file has no data rows.");
        return;
      }
      const header = table[0].map((h) => h.trim().toLowerCase());
      const nameIdx = header.indexOf("name");
      const emailIdx = header.indexOf("email");
      const categoryIdx = header.indexOf("category");
      if (nameIdx === -1 || emailIdx === -1) {
        setImportError('The CSV must have "Name" and "Email" columns.');
        return;
      }

      const rows = table.slice(1).map((r) => ({
        name: r[nameIdx] ?? "",
        email: r[emailIdx] ?? "",
        category: categoryIdx !== -1 ? r[categoryIdx] : undefined,
      }));

      startTransition(async () => {
        const result = await bulkImportUsersAction(rows);
        setImportResult(result);
        router.refresh();
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          <DownloadIcon className="h-4 w-4" />
          Export CSV
        </button>
        <button
          onClick={handleImportClick}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadIcon className="h-4 w-4" />
          {pending ? "Importing…" : "Import CSV"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="hidden"
        />
        <AddUserModal />
      </div>

      {importError && (
        <p className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
          {importError}
        </p>
      )}
      {importResult && (
        <div className="max-w-sm rounded-lg bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-800">
            Imported {importResult.created} user{importResult.created !== 1 ? "s" : ""}.
          </p>
          {importResult.skipped.length > 0 && (
            <>
              <p className="mt-1 text-muted">Skipped {importResult.skipped.length}:</p>
              <ul className="mt-0.5 max-h-24 space-y-0.5 overflow-y-auto">
                {importResult.skipped.map((s, i) => (
                  <li key={i} className="truncate">
                    {s.email} — {s.reason}
                  </li>
                ))}
              </ul>
            </>
          )}
          {importResult.created > 0 && (
            <p className="mt-1 text-muted">
              New accounts must use &ldquo;Forgot password&rdquo; to set their login credentials.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
