import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { FeaturedCourse } from "@/components/FeaturedCourse";
import { CheckCircleIcon, PersonalityIcon } from "@/components/icons";
import { getCourse } from "@/lib/courses-server";

const traits = [
  { label: "Working with others", value: "Collaborative" },
  { label: "Handling pressure", value: "Resilient" },
  { label: "Approach to detail", value: "Methodical" },
  { label: "Decision making", value: "Considered" },
];

const learn = [
  "What workplace personality questionnaires actually measure",
  "How to answer authentically without contradicting yourself",
  "How to present your natural strengths for the right roles",
];

export default async function PersonalityPage() {
  const featured = await getCourse("personality-profiler");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Personality"
        subtitle="Understand your strengths and how employers assess fit."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-surface p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-800">In this track</h2>
          <ul className="mt-4 space-y-3">
            {learn.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-surface p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy-50 text-navy">
              <PersonalityIcon className="h-6 w-6" />
            </span>
            <h3 className="text-base font-bold text-slate-800">Your snapshot</h3>
          </div>
          <p className="mt-1 text-xs text-muted">
            An illustrative profile — take the assessment for your real results.
          </p>
          <dl className="mt-4 space-y-3">
            {traits.map((t) => (
              <div key={t.label} className="flex items-center justify-between text-sm">
                <dt className="text-muted">{t.label}</dt>
                <dd className="font-semibold text-slate-800">{t.value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/courses/personality-profiler"
            className="mt-5 block rounded-lg bg-navy py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Take the assessment
          </Link>
        </div>
      </div>

      {featured && <FeaturedCourse course={featured} />}
    </div>
  );
}
