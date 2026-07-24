"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  updateResumeDetailsAction,
  addExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
  addEducationAction,
  updateEducationAction,
  deleteEducationAction,
  addSkillAction,
  deleteSkillAction,
  addProjectAction,
  updateProjectAction,
  deleteProjectAction,
  type ResumeData,
  type ResumeExperienceRow,
  type ResumeEducationRow,
  type ResumeProjectRow,
  type ResumeSkillRow,
  type VerifiedCertificateRow,
} from "@/app/actions/resume";
import { ResumePreview } from "@/components/ResumePreview";
import { generateResumePdf } from "@/lib/resume-pdf";
import { DownloadIcon } from "@/components/icons";

function toMonthInput(iso: string | null): string {
  return iso ? iso.slice(0, 7) : "";
}

function formatRange(start: string | null, end: string | null, current: boolean): string {
  const s = start ? new Date(start).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
  const e = current ? "Present" : end ? new Date(end).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
  if (!s && !e) return "";
  return `${s} – ${e}`;
}

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy";
const labelClass = "mb-1 block text-xs font-semibold text-slate-700";
const cardClass = "rounded-2xl border border-line bg-surface p-5";
const secondaryButtonClass =
  "rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted disabled:opacity-60";
const primaryButtonClass =
  "rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60";

export function ResumeBuilderForm({ resume }: { resume: ResumeData }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateResumePdf(resume);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">CV Builder</h1>
          <p className="mt-1 text-sm text-muted">
            Build your CV from your real academy profile — experience, education, projects, skills and
            verified certificates.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DownloadIcon className="h-4 w-4" />
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <ResumeDetailsForm resume={resume} />
          <ExperienceSection resumeExperience={resume.experience} />
          <EducationSection resumeEducation={resume.education} />
          <ProjectsSection resumeProjects={resume.projects} />
          <SkillsSection resumeSkills={resume.skills} />
          <CertificatesSection certificates={resume.certificates} />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ResumePreview resume={resume} />
        </div>
      </div>
    </div>
  );
}

// ---------- Contact, links & summary ----------

function ResumeDetailsForm({ resume }: { resume: ResumeData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      headline: String(form.get("headline") ?? ""),
      summary: String(form.get("summary") ?? ""),
      phone: String(form.get("phone") ?? ""),
      location: String(form.get("location") ?? ""),
      linkedinUrl: String(form.get("linkedinUrl") ?? ""),
      githubUrl: String(form.get("githubUrl") ?? ""),
      portfolioUrl: String(form.get("portfolioUrl") ?? ""),
    };
    startTransition(async () => {
      await updateResumeDetailsAction(input);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cardClass}>
      <h3 className="text-sm font-bold text-slate-800">Contact & Summary</h3>
      <p className="mt-1 text-xs text-muted">
        Name and email come from your account profile. {resume.contactName} · {resume.contactEmail}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className={labelClass}>Headline</label>
          <input
            name="headline"
            defaultValue={resume.headline}
            placeholder="e.g. Frontend Engineer | Full-Stack Web Development"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Summary</label>
          <textarea
            name="summary"
            rows={4}
            defaultValue={resume.summary}
            placeholder="A short pitch about your background and what you're looking for."
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" defaultValue={resume.phone} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input name="location" defaultValue={resume.location} placeholder="City, Country" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input name="linkedinUrl" defaultValue={resume.linkedinUrl} placeholder="linkedin.com/in/…" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>GitHub</label>
            <input name="githubUrl" defaultValue={resume.githubUrl} placeholder="github.com/…" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Portfolio</label>
            <input name="portfolioUrl" defaultValue={resume.portfolioUrl} placeholder="yourdomain.com" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && <span className="text-xs font-semibold text-green-600">Saved</span>}
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ---------- Experience ----------

function ExperienceSection({ resumeExperience }: { resumeExperience: ResumeExperienceRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (id: "new" | string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const input = {
      company: String(form.get("company") ?? "").trim(),
      role: String(form.get("role") ?? "").trim(),
      location: String(form.get("location") ?? "").trim(),
      startDate: String(form.get("startDate") ?? "") || null,
      endDate: String(form.get("endDate") ?? "") || null,
      current: form.get("current") === "on",
      description: String(form.get("description") ?? "").trim(),
    };
    if (!input.company || !input.role) {
      setError("Company and role are required.");
      return;
    }
    startTransition(async () => {
      const result = id === "new" ? await addExperienceAction(input) : await updateExperienceAction(id, input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteExperienceAction(id);
      router.refresh();
    });
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Experience</h3>
        {editing === null && (
          <button onClick={() => setEditing("new")} className={secondaryButtonClass}>
            + Add
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {resumeExperience.map((exp) =>
          editing === exp.id ? (
            <ExperienceForm
              key={exp.id}
              defaultValues={exp}
              pending={pending}
              error={error}
              onSubmit={handleSubmit(exp.id)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={exp.id} className="rounded-xl bg-surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {exp.role}
                    {exp.company ? `, ${exp.company}` : ""}
                  </p>
                  <p className="text-xs text-muted">
                    {formatRange(exp.startDate, exp.endDate, exp.current)}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.description && (
                    <p className="mt-1.5 whitespace-pre-line text-xs text-slate-600">{exp.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => setEditing(exp.id)} className="text-xs font-semibold text-navy-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(exp.id)} className="text-xs font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ),
        )}
        {editing === "new" && (
          <ExperienceForm pending={pending} error={error} onSubmit={handleSubmit("new")} onCancel={() => setEditing(null)} />
        )}
        {resumeExperience.length === 0 && editing === null && (
          <p className="text-xs text-muted">No experience added yet.</p>
        )}
      </div>
    </div>
  );
}

function ExperienceForm({
  defaultValues,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  defaultValues?: ResumeExperienceRow;
  pending: boolean;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const [current, setCurrent] = useState(defaultValues?.current ?? false);
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-dashed border-line bg-surface-muted p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Role / Title</label>
          <input name="role" defaultValue={defaultValues?.role} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Company</label>
          <input name="company" defaultValue={defaultValues?.company} required className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Location</label>
        <input name="location" defaultValue={defaultValues?.location} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="month" name="startDate" defaultValue={toMonthInput(defaultValues?.startDate ?? null)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="month"
            name="endDate"
            disabled={current}
            defaultValue={toMonthInput(defaultValues?.endDate ?? null)}
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <input type="checkbox" name="current" checked={current} onChange={(e) => setCurrent(e.target.checked)} />
        I currently work here
      </label>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} defaultValue={defaultValues?.description} className={inputClass} />
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ---------- Education ----------

function EducationSection({ resumeEducation }: { resumeEducation: ResumeEducationRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (id: "new" | string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const input = {
      school: String(form.get("school") ?? "").trim(),
      degree: String(form.get("degree") ?? "").trim(),
      fieldOfStudy: String(form.get("fieldOfStudy") ?? "").trim(),
      startDate: String(form.get("startDate") ?? "") || null,
      endDate: String(form.get("endDate") ?? "") || null,
      current: form.get("current") === "on",
      description: String(form.get("description") ?? "").trim(),
    };
    if (!input.school) {
      setError("School is required.");
      return;
    }
    startTransition(async () => {
      const result = id === "new" ? await addEducationAction(input) : await updateEducationAction(id, input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteEducationAction(id);
      router.refresh();
    });
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Education</h3>
        {editing === null && (
          <button onClick={() => setEditing("new")} className={secondaryButtonClass}>
            + Add
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {resumeEducation.map((edu) => {
          const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
          return editing === edu.id ? (
            <EducationForm
              key={edu.id}
              defaultValues={edu}
              pending={pending}
              error={error}
              onSubmit={handleSubmit(edu.id)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={edu.id} className="rounded-xl bg-surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {degreeLine ? `${degreeLine} — ${edu.school}` : edu.school}
                  </p>
                  <p className="text-xs text-muted">{formatRange(edu.startDate, edu.endDate, edu.current)}</p>
                  {edu.description && (
                    <p className="mt-1.5 whitespace-pre-line text-xs text-slate-600">{edu.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => setEditing(edu.id)} className="text-xs font-semibold text-navy-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(edu.id)} className="text-xs font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {editing === "new" && (
          <EducationForm pending={pending} error={error} onSubmit={handleSubmit("new")} onCancel={() => setEditing(null)} />
        )}
        {resumeEducation.length === 0 && editing === null && (
          <p className="text-xs text-muted">No education added yet.</p>
        )}
      </div>
    </div>
  );
}

function EducationForm({
  defaultValues,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  defaultValues?: ResumeEducationRow;
  pending: boolean;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const [current, setCurrent] = useState(defaultValues?.current ?? false);
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-dashed border-line bg-surface-muted p-4">
      <div>
        <label className={labelClass}>School</label>
        <input name="school" defaultValue={defaultValues?.school} required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Degree</label>
          <input name="degree" defaultValue={defaultValues?.degree} placeholder="e.g. B.Sc." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Field of Study</label>
          <input name="fieldOfStudy" defaultValue={defaultValues?.fieldOfStudy} placeholder="e.g. Computer Science" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="month" name="startDate" defaultValue={toMonthInput(defaultValues?.startDate ?? null)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="month"
            name="endDate"
            disabled={current}
            defaultValue={toMonthInput(defaultValues?.endDate ?? null)}
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <input type="checkbox" name="current" checked={current} onChange={(e) => setCurrent(e.target.checked)} />
        I'm currently studying here
      </label>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} defaultValue={defaultValues?.description} className={inputClass} />
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ---------- Projects ----------

function ProjectsSection({ resumeProjects }: { resumeProjects: ResumeProjectRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (id: "new" | string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const input = {
      title: String(form.get("title") ?? "").trim(),
      url: String(form.get("url") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
    };
    if (!input.title) {
      setError("Title is required.");
      return;
    }
    startTransition(async () => {
      const result = id === "new" ? await addProjectAction(input) : await updateProjectAction(id, input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteProjectAction(id);
      router.refresh();
    });
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Projects</h3>
        {editing === null && (
          <button onClick={() => setEditing("new")} className={secondaryButtonClass}>
            + Add
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {resumeProjects.map((p) =>
          editing === p.id ? (
            <ProjectForm
              key={p.id}
              defaultValues={p}
              pending={pending}
              error={error}
              onSubmit={handleSubmit(p.id)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={p.id} className="rounded-xl bg-surface-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{p.title}</p>
                  {p.url && <p className="text-xs text-navy-600">{p.url}</p>}
                  {p.description && (
                    <p className="mt-1.5 whitespace-pre-line text-xs text-slate-600">{p.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => setEditing(p.id)} className="text-xs font-semibold text-navy-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ),
        )}
        {editing === "new" && (
          <ProjectForm pending={pending} error={error} onSubmit={handleSubmit("new")} onCancel={() => setEditing(null)} />
        )}
        {resumeProjects.length === 0 && editing === null && (
          <p className="text-xs text-muted">No projects added yet.</p>
        )}
      </div>
    </div>
  );
}

function ProjectForm({
  defaultValues,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  defaultValues?: ResumeProjectRow;
  pending: boolean;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-dashed border-line bg-surface-muted p-4">
      <div>
        <label className={labelClass}>Title</label>
        <input name="title" defaultValue={defaultValues?.title} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>URL</label>
        <input name="url" defaultValue={defaultValues?.url} placeholder="github.com/you/project" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={3} defaultValue={defaultValues?.description} className={inputClass} />
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={pending} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ---------- Skills ----------

function SkillsSection({ resumeSkills }: { resumeSkills: ResumeSkillRow[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await addSkillAction(trimmed);
      setValue("");
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSkillAction(id);
      router.refresh();
    });
  };

  return (
    <div className={cardClass}>
      <h3 className="text-sm font-bold text-slate-800">Skills</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {resumeSkills.map((s) => (
          <span
            key={s.id}
            className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-slate-700"
          >
            {s.name}
            <button
              onClick={() => handleDelete(s.id)}
              aria-label={`Remove ${s.name}`}
              className="text-slate-400 transition-colors hover:text-red-600"
            >
              ×
            </button>
          </span>
        ))}
        {resumeSkills.length === 0 && <p className="text-xs text-muted">No skills added yet.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. React, Python, SQL"
          className={`flex-1 ${inputClass}`}
        />
        <button onClick={handleAdd} disabled={pending || !value.trim()} className={primaryButtonClass}>
          Add
        </button>
      </div>
    </div>
  );
}

// ---------- Verified certificates (read-only, sourced live from Certificate table) ----------

function CertificatesSection({ certificates }: { certificates: VerifiedCertificateRow[] }) {
  if (certificates.length === 0) return null;
  return (
    <div className={cardClass}>
      <h3 className="text-sm font-bold text-slate-800">Verified Certificates</h3>
      <p className="mt-1 text-xs text-muted">
        Automatically added from your earned TekSkillUp certificates — always accurate, never editable.
      </p>
      <div className="mt-3 space-y-2">
        {certificates.map((c) => (
          <div key={c.id} className="rounded-xl bg-surface-muted px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-800">{c.courseTitle}</p>
            <p className="text-xs text-muted">
              Issued {new Date(c.dateIssued).toLocaleDateString(undefined, { year: "numeric", month: "short" })} ·{" "}
              {c.id}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
