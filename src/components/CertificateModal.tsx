"use client";

import { useEffect, useRef, useState } from "react";
import { drawCertificate, credentialId } from "@/lib/certificate";
import { updateCertificateName } from "@/app/actions/profile";
import { issueCertificateAction } from "@/app/actions/certificate";
import { CloseIcon, LinkedInIcon } from "@/components/icons";
import { refreshNotifications } from "@/lib/useNotifications";

type CertificateModalProps = {
  courseSlug: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  onClose: () => void;
};

const SAVE_DEBOUNCE_MS = 500;

export function CertificateModal({
  courseSlug,
  courseTitle,
  studentName,
  instructorName,
  onClose,
}: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(studentName);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const credId = credentialId(name, courseTitle);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Issue certificate on database lookup
  useEffect(() => {
    issueCertificateAction(courseSlug, name)
      .then(refreshNotifications)
      .catch((err) => {
        console.error("Failed to register certificate on load", err);
      });
  }, [courseSlug]);

  // Cancel any pending debounced save on unmount.
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  // Lock scroll + Escape to close.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Redraw whenever inputs change.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    drawCertificate(ctx, {
      name,
      course: courseTitle,
      instructor: instructorName,
      date,
      credId,
    });
  }, [name, courseTitle, instructorName, date, credId]);

  const fileSlug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (value: string) => {
    setName(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      Promise.all([
        updateCertificateName(value),
        issueCertificateAction(courseSlug, value),
      ]).catch((err) => {
        console.error("Failed to save certificate name and issue cert", err);
      });
    }, SAVE_DEBOUNCE_MS);
  };

  const download = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `tekskillup-certificate-${fileSlug}.png`;
    a.click();
  };

  const print = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    if (!url) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!doctype html><title>Certificate — ${name}</title>` +
        `<style>@page{size:landscape;margin:0}body{margin:0}img{width:100%}</style>` +
        `<img src="${url}" onload="window.print();setTimeout(()=>window.close(),300)">`,
    );
    w.document.close();
  };

  const downloadPdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`tekskillup-certificate-${fileSlug}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  };

  const addToLinkedIn = () => {
    const certUrl = `${window.location.origin}/verify/${credId}`;
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: courseTitle,
      organizationName: "TekSkillUp",
      issueYear: String(now.getFullYear()),
      issueMonth: String(now.getMonth() + 1),
      certUrl,
      certId: credId,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Your Certificate</h3>
            <p className="text-xs text-muted">
              Personalise, download or print your achievement
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate canvas */}
        <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-6">
          <canvas
            ref={canvasRef}
            width={1600}
            height={1140}
            className="mx-auto h-auto w-full max-w-3xl rounded-lg shadow-md"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:max-w-xs sm:flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Recipient name
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm outline-none focus:border-navy-600"
            />
            <p className="mt-1 text-[11px] text-muted">Credential ID: {credId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={addToLinkedIn}
              className="flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <LinkedInIcon className="h-4 w-4 text-[#0A66C2]" />
              Add to LinkedIn
            </button>
            <button
              onClick={print}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Print
            </button>
            <button
              onClick={download}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Download PNG
            </button>
            <button
              onClick={downloadPdf}
              disabled={pdfBusy}
              className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
            >
              {pdfBusy ? "Preparing…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
