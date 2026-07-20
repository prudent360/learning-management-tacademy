"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CheckCircleIcon, MessageIcon, SupportIcon, ChevronDownIcon } from "@/components/icons";

const faqs = [
  {
    q: "How do I reset my course progress?",
    a: "Progress is tracked automatically as you complete lessons. To reset a course, contact support and we'll clear it for you.",
  },
  {
    q: "When are payouts and certificates issued?",
    a: "Certificates are issued automatically once you complete 100% of a course's lessons and pass its final quiz.",
  },
  {
    q: "Can I reschedule a coaching session?",
    a: "Yes — head to Book A Coach, cancel your existing slot, and pick a new time that suits you.",
  },
  {
    q: "Which browsers are supported?",
    a: "The platform works on the latest versions of Chrome, Safari, Edge and Firefox, on desktop and mobile.",
  },
];

export function ContactSupportView() {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Support"
        subtitle="We usually reply within one business day."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Form */}
        <div className="rounded-2xl bg-surface p-5 md:p-6">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-brand-green">
                <CheckCircleIcon className="h-8 w-8" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-800">Message sent</h3>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Thanks for reaching out — our team will get back to you at your email address shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy-50"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-slate-800">Send us a message</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" placeholder="Ifiok Ekpo" required />
                <Field label="Email" type="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
                <select className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600">
                  <option>Course access</option>
                  <option>Billing &amp; payouts</option>
                  <option>Coaching &amp; sessions</option>
                  <option>Technical issue</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* Channels */}
        <div className="space-y-4">
          <Channel
            icon={<MessageIcon className="h-5 w-5" />}
            title="Live chat"
            detail="Mon–Fri, 9am–6pm"
            accent="orange"
          />
          <Channel
            icon={<SupportIcon className="h-5 w-5" />}
            title="Email us"
            detail="support@tekskillup.com"
            accent="navy"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Frequently asked</h2>
        <div className="divide-y divide-line">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{f.q}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && <p className="pb-4 text-sm text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-navy-600"
      />
    </div>
  );
}

function Channel({
  icon,
  title,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  accent: "navy" | "orange";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
      <span
        className={`grid h-11 w-11 place-items-center rounded-lg ${
          accent === "orange" ? "bg-orange-50 text-orange-600" : "bg-navy-50 text-navy"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
    </div>
  );
}
