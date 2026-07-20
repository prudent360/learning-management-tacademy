"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  getEmailTemplate,
  saveEmailTemplateAction,
  type EmailTemplateInput,
} from "@/app/actions/settings";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/RichTextEditor";
import { CloseIcon } from "@/components/icons";

const PLACEHOLDERS = [
  "{{user_name}}",
  "{{user_email}}",
  "{{course_title}}",
  "{{site_name}}",
  "{{support_email}}",
  "{{login_url}}",
];

const EMPTY: EmailTemplateInput = { key: "", name: "", description: "", subject: "", body: "" };

export function EmailTemplateModal({
  templateKey,
  onClose,
  onSaved,
}: {
  templateKey: string | "__new__";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = templateKey === "__new__";
  const [loading, setLoading] = useState(!isNew);
  const [data, setData] = useState<EmailTemplateInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editorRef = useRef<RichTextEditorHandle>(null);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      const t = await getEmailTemplate(templateKey);
      if (!cancelled && t) {
        setData({ key: t.key, name: t.name, description: t.description, subject: t.subject, body: t.body });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [templateKey, isNew]);

  const set = <K extends keyof EmailTemplateInput>(k: K, v: EmailTemplateInput[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveEmailTemplateAction(data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-base font-bold text-slate-800">
            {isNew ? "New Email Template" : `Edit: ${data.name || templateKey}`}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-surface-muted hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted">Loading…</p>
          ) : (
            <>
              {isNew && (
                <Field label="Key">
                  <input
                    value={data.key}
                    onChange={(e) => set("key", e.target.value)}
                    placeholder="booking-cancelled"
                    className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                  />
                </Field>
              )}

              <Field label="Name">
                <input
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Booking Cancelled"
                  className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </Field>

              <Field label="Subject">
                <input
                  value={data.subject}
                  onChange={(e) => set("subject", e.target.value)}
                  placeholder="Your booking has been cancelled"
                  className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </Field>

              <Field label="Description">
                <input
                  value={data.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Sent when…"
                  className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </Field>

              <Field label="Email Body">
                <RichTextEditor ref={editorRef} value={data.body} onChange={(html) => set("body", html)} />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PLACEHOLDERS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editorRef.current?.insertText(p)}
                      className="rounded-md bg-surface-muted px-2 py-1 font-mono text-[11px] text-slate-600 transition-colors hover:bg-navy-50 hover:text-navy"
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-muted">
                  Format text using the toolbar above. Click placeholders below to insert them.
                </p>
              </Field>
            </>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={pending || loading}
            className="rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : isNew ? "Create Template" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  );
}
