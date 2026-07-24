import type { ResumeData } from "@/app/actions/resume";

function formatMonthYear(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

function dateRange(start: string | null, end: string | null, current: boolean): string {
  const startLabel = formatMonthYear(start);
  const endLabel = current ? "Present" : formatMonthYear(end) || "Present";
  return startLabel ? `${startLabel} – ${endLabel}` : "";
}

/** Renders the resume as a real, text-selectable PDF (no screenshot/canvas) so it stays ATS-friendly. */
export async function generateResumePdf(resume: ResumeData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const maxWidth = pageWidth - marginX * 2;
  let y = 56;

  function ensureSpace(lines: number, lineHeight = 14) {
    if (y + lines * lineHeight > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  }

  function heading(text: string) {
    ensureSpace(2, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(text.toUpperCase(), marginX, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 14;
  }

  function paragraph(text: string, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) {
    if (!text) return;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 10);
    const [r, g, b] = opts.color ?? [30, 41, 59];
    doc.setTextColor(r, g, b);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    ensureSpace(lines.length);
    doc.text(lines, marginX, y);
    y += lines.length * 13;
  }

  function entryHeader(title: string, range: string) {
    ensureSpace(2, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, marginX, y);
    if (range) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(range, pageWidth - marginX, y, { align: "right" });
    }
    y += 13;
  }

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(resume.contactName || "Your Name", marginX, y);
  y += 20;

  if (resume.headline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(resume.headline, marginX, y);
    y += 16;
  }

  const contactBits = [
    resume.contactEmail,
    resume.phone,
    resume.location,
    resume.linkedinUrl,
    resume.githubUrl,
    resume.portfolioUrl,
  ].filter(Boolean);
  if (contactBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const wrapped = doc.splitTextToSize(contactBits.join("   •   "), maxWidth) as string[];
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 12 + 6;
  }

  y += 4;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.2);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineWidth(0.5);
  y += 20;

  if (resume.summary) {
    heading("Summary");
    paragraph(resume.summary);
    y += 10;
  }

  if (resume.experience.length) {
    heading("Experience");
    for (const exp of resume.experience) {
      entryHeader(
        `${exp.role}${exp.company ? `, ${exp.company}` : ""}`,
        dateRange(exp.startDate, exp.endDate, exp.current),
      );
      if (exp.location) paragraph(exp.location, { size: 9, color: [100, 116, 139] });
      paragraph(exp.description);
      y += 8;
    }
  }

  if (resume.education.length) {
    heading("Education");
    for (const edu of resume.education) {
      const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
      entryHeader(
        degreeLine ? `${degreeLine} — ${edu.school}` : edu.school,
        dateRange(edu.startDate, edu.endDate, edu.current),
      );
      paragraph(edu.description);
      y += 8;
    }
  }

  if (resume.projects.length) {
    heading("Projects");
    for (const proj of resume.projects) {
      entryHeader(proj.title, "");
      if (proj.url) paragraph(proj.url, { size: 9, color: [37, 99, 235] });
      paragraph(proj.description);
      y += 8;
    }
  }

  if (resume.skills.length) {
    heading("Skills");
    paragraph(resume.skills.map((s) => s.name).join("   •   "));
    y += 10;
  }

  if (resume.certificates.length) {
    heading("Verified Certificates");
    for (const cert of resume.certificates) {
      ensureSpace(1, 13);
      const dateLabel = new Date(cert.dateIssued).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${cert.courseTitle} — TekSkillUp — ${dateLabel} (${cert.id})`, marginX, y);
      y += 14;
    }
  }

  const fileSlug = (resume.contactName || "resume")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`tekskillup-cv-${fileSlug || "resume"}.pdf`);
}
