"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEmailTemplateAction } from "@/app/actions/settings";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { EmailTemplateModal } from "@/components/settings/EmailTemplateModal";
import { EmailPreviewModal } from "@/components/settings/EmailPreviewModal";
import { MailIcon, EyeIcon } from "@/components/icons";

type TemplateRow = {
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  updatedAt: Date;
};

export function EmailTemplatesListClient({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<TemplateRow | null>(null);
  const [disabledTemplates, setDisabledTemplates] = useState<Record<string, boolean>>({});

  const closeModal = () => setEditing(null);
  const handleSaved = () => {
    setEditing(null);
    router.refresh();
  };

  const toggleDisable = (key: string) => {
    setDisabledTemplates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-5 md:p-6 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MailIcon className="h-5 w-5 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-800">Email Templates</h2>
          </div>
          <p className="text-xs text-muted">
            Customize the emails sent to customers. Use placeholders like{" "}
            <code className="font-mono text-slate-500 bg-slate-50 border border-line/60 rounded px-1 text-[10px]">
              {"{{user_name}}"}
            </code>{" "}
            to insert dynamic content.
          </p>
        </div>
        <button
          onClick={() => setEditing("__new__")}
          className="self-start sm:self-auto rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700 shadow-sm shrink-0"
        >
          + New Template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((t) => {
          const isDisabled = !!disabledTemplates[t.key];
          return (
            <div
              key={t.key}
              className={`rounded-lg border border-line bg-surface p-4 md:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:border-slate-300/80 ${
                isDisabled ? "opacity-65" : ""
              }`}
            >
              {/* Template Details */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{t.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors ${
                      isDisabled
                        ? "bg-slate-50 text-slate-500 border-slate-200"
                        : "bg-green-50 text-brand-green border-green-200"
                    }`}
                  >
                    {isDisabled ? "Disabled" : "Active"}
                  </span>
                </div>

                <div className="space-y-1">
                  {t.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    Subject: <span className="text-slate-600 font-medium">{t.subject || "—"}</span>
                  </p>
                </div>

                {/* Placeholders */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {extractPlaceholders(t.subject + " " + t.body).map((ph) => (
                    <span
                      key={ph}
                      className="rounded bg-slate-50 border border-line text-slate-600 font-mono text-[9px] px-1.5 py-0.5"
                    >
                      {ph}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => setPreviewing(t)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <EyeIcon className="h-3.5 w-3.5 text-slate-400" />
                  Preview
                </button>
                <button
                  onClick={() => setEditing(t.key)}
                  className="rounded-lg bg-orange px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600 shadow-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleDisable(t.key)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {isDisabled ? "Enable" : "Disable"}
                </button>
                <ConfirmDeleteButton
                  onDelete={deleteEmailTemplateAction.bind(null, t.key)}
                  itemLabel={t.name}
                />
              </div>
            </div>
          );
        })}

        {templates.length === 0 && (
          <div className="rounded-lg border border-dashed border-line bg-surface p-12 text-center">
            <MailIcon className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No email templates yet.</p>
            <p className="mt-1 text-xs text-muted">
              Create your first template to start sending branded emails.
            </p>
          </div>
        )}
      </div>

      {editing && (
        <EmailTemplateModal
          templateKey={editing}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {previewing && (
        <EmailPreviewModal
          template={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
    </div>
  );
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{[a-z_]+\}\}/g);
  if (!matches) return [];
  return [...new Set(matches)];
}
