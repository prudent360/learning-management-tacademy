import Link from "next/link";
import { getCertificateAction } from "@/app/actions/certificate";
import { VerifyCanvasPreview } from "@/components/VerifyCanvasPreview";
import { CheckCircleIcon } from "@/components/icons";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CertificateVerifyDetailsPage({ params }: Props) {
  const { id } = await params;
  const cert = await getCertificateAction(id);

  if (!cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200/60 shadow-xl space-y-6">
          <span className="text-4xl">⚠️</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Credential Not Found
            </h2>
            <p className="mt-2 text-xs text-muted">
              We couldn&apos;t find a certificate matching the ID <span className="font-semibold text-slate-700">{id}</span>.
            </p>
          </div>
          <div className="bg-red-50 text-red-700 text-xs border border-red-100 rounded-lg p-3">
            Please check the spelling of the ID (it should look like TSU-XXXXXX) or check if the certificate is valid.
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/verify"
              className="rounded-lg bg-navy py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-navy-700 shadow-sm"
            >
              Try Another Lookup
            </Link>
            <Link
              href="/"
              className="text-xs text-muted hover:underline"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between">
      <div className="max-w-4xl w-full mx-auto bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-xl space-y-8">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">TekSkillUp Academy</h1>
              <p className="text-[10px] text-muted">Official Verification System</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 px-3 py-1 text-xs font-semibold text-brand-green shadow-sm w-fit">
            <CheckCircleIcon className="h-4 w-4 shrink-0" />
            Verified Credential
          </span>
        </div>

        {/* Certificate metadata grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-line">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Name</h3>
            <p className="text-base font-extrabold text-slate-800 mt-1">{cert.studentName}</p>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-5">Program Completed</h3>
            <p className="text-sm font-bold text-navy mt-1">{cert.courseTitle}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Issued</h3>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {new Date(cert.dateIssued).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-5">Credential ID</h3>
            <p className="text-sm font-mono font-bold text-slate-800 mt-1">{cert.id}</p>
          </div>
        </div>

        {/* Preview Container */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3">Certificate Preview</h2>
          <VerifyCanvasPreview
            studentName={cert.studentName}
            courseTitle={cert.courseTitle}
            instructorName={cert.instructorName}
            dateIssued={cert.dateIssued}
            credentialId={cert.id}
          />
        </div>

        <div className="text-center pt-4 border-t border-line">
          <Link
            href="/verify"
            className="text-xs text-navy font-semibold hover:underline"
          >
            ← Verify Another Certificate
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-muted mt-6">
        &copy; {new Date().getFullYear()} TekSkillUp Academy. Verified student certification database.
      </div>
    </div>
  );
}
