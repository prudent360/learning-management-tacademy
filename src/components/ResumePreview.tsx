import type { ReactNode } from "react";
import type { ResumeData } from "@/app/actions/resume";

function formatRange(start: string | null, end: string | null, current: boolean): string {
  const s = start ? new Date(start).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
  const e = current ? "Present" : end ? new Date(end).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
  if (!s && !e) return "";
  return `${s} – ${e}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4 border-t border-line pt-3 first:mt-0 first:border-t-0 first:pt-0">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      {children}
    </div>
  );
}

/** Read-only, on-screen mirror of the CV. Purely presentational — the real PDF is generated separately via resume-pdf.ts. */
export function ResumePreview({ resume }: { resume: ResumeData }) {
  const contactBits = [
    resume.contactEmail,
    resume.phone,
    resume.location,
    resume.linkedinUrl,
    resume.githubUrl,
    resume.portfolioUrl,
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-[13px] leading-snug shadow-sm">
      <p className="text-base font-bold text-slate-900">{resume.contactName || "Your Name"}</p>
      {resume.headline && <p className="mt-0.5 text-xs font-medium text-slate-600">{resume.headline}</p>}
      {contactBits.length > 0 && (
        <p className="mt-1.5 text-[11px] text-muted">{contactBits.join(" · ")}</p>
      )}

      {resume.summary && (
        <Section title="Summary">
          <p className="whitespace-pre-line text-xs text-slate-700">{resume.summary}</p>
        </Section>
      )}

      {resume.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800">
                    {exp.role}
                    {exp.company ? `, ${exp.company}` : ""}
                  </p>
                  <p className="shrink-0 text-[11px] text-muted">
                    {formatRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {exp.description && (
                  <p className="mt-0.5 whitespace-pre-line text-[11px] text-slate-600">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {resume.education.map((edu) => {
              const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
              return (
                <div key={edu.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800">
                      {degreeLine ? `${degreeLine} — ${edu.school}` : edu.school}
                    </p>
                    <p className="shrink-0 text-[11px] text-muted">
                      {formatRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </div>
                  {edu.description && (
                    <p className="mt-0.5 whitespace-pre-line text-[11px] text-slate-600">{edu.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {resume.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-2">
            {resume.projects.map((p) => (
              <div key={p.id}>
                <p className="text-xs font-bold text-slate-800">{p.title}</p>
                {p.url && <p className="text-[11px] text-navy-600">{p.url}</p>}
                {p.description && (
                  <p className="mt-0.5 whitespace-pre-line text-[11px] text-slate-600">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.skills.length > 0 && (
        <Section title="Skills">
          <p className="text-xs text-slate-700">{resume.skills.map((s) => s.name).join(" · ")}</p>
        </Section>
      )}

      {resume.certificates.length > 0 && (
        <Section title="Verified Certificates">
          <div className="space-y-1">
            {resume.certificates.map((c) => (
              <p key={c.id} className="text-[11px] text-slate-700">
                {c.courseTitle} —{" "}
                {new Date(c.dateIssued).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
              </p>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
