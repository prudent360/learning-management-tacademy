"use client";

import { useState } from "react";
import { CloseIcon, MailIcon } from "@/components/icons";
import { sendTestEmailAction } from "@/app/actions/settings";

type TemplateRow = {
  key: string;
  name: string;
  subject: string;
  body: string;
};

const SAMPLE_DATA: Record<string, string> = {
  "{{user_name}}": "John Doe",
  "{{user_email}}": "john.doe@example.com",
  "{{course_title}}": "Full-Stack Web Development",
  "{{site_name}}": "TekSkillUp",
  "{{support_email}}": "support@tekskillup.com",
  "{{login_url}}": "https://tekskillup.com/login",
};

function interpolate(text: string): string {
  return text.replace(/\{\{[a-z_]+\}\}/g, (match) => SAMPLE_DATA[match] ?? match);
}

export function EmailPreviewModal({
  template,
  onClose,
}: {
  template: TemplateRow;
  onClose: () => void;
}) {
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderedSubject = interpolate(template.subject);
  const renderedBody = interpolate(template.body);

  const handleSendTest = async () => {
    if (!testEmail) return;
    setSending(true);
    setError(null);
    setSent(false);

    try {
      const res = await sendTestEmailAction(template.key, testEmail);
      if (res.success) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Failed to dispatch test email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
          <h2 className="text-base font-bold text-slate-800">
            Preview: {template.name}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-thin">
          {/* Subject */}
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              Subject:
            </p>
            <p className="text-sm font-bold text-slate-800">{renderedSubject}</p>
          </div>

          {/* Email Body — rendered with inline styles as a real email client would show */}
          <div className="bg-slate-100 px-6 py-6">
            <div
              className="mx-auto max-w-[600px] [&_a]:pointer-events-none"
              dangerouslySetInnerHTML={{ __html: renderedBody }}
            />
          </div>

          {/* Send Test Email Section */}
          <div className="border-t border-slate-200 bg-white px-6 py-4 space-y-3 shrink-0">
            <p className="text-xs font-bold text-slate-700">Send Test Email</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:border-navy-600 transition-colors"
                />
              </div>
              <button
                onClick={handleSendTest}
                disabled={!testEmail || sending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
              >
                {sending ? (
                  "Sending…"
                ) : sent ? (
                  <>✓ Sent</>
                ) : (
                  <>✈ Send Test</>
                )}
              </button>
            </div>
            {sent && (
              <p className="text-[10px] text-brand-green font-bold">
                ✓ Test email successfully sent to {testEmail}! Check your inbox.
              </p>
            )}
            {error && (
              <p className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200/50 p-2.5 rounded-lg leading-relaxed">
                ⚠️ Sending Failed: {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
