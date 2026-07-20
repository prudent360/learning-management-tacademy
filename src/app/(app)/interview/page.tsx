import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { FeaturedCourse } from "@/components/FeaturedCourse";
import { CheckCircleIcon, InterviewIcon } from "@/components/icons";
import { getCourse } from "@/lib/courses-server";

const skills = [
  "Decode any job description into the competencies you'll be tested on",
  "Structure answers with the STAR-L method so they land every time",
  "Stay composed when you're asked something you didn't prepare for",
  "Ask questions that mark you out as a serious candidate",
];

export default async function InterviewPage() {
  const featured = await getCourse("interview-formula");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview"
        subtitle="Turn interviews into predictable offers with a repeatable system."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-surface p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-800">What you&apos;ll master</h2>
          <ul className="mt-4 space-y-3">
            {skills.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-navy p-6 text-white">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
              <InterviewIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Practice with a coach</h3>
            <p className="mt-1 text-sm text-white/70">
              Book a one-to-one mock interview and get scored, actionable feedback.
            </p>
          </div>
          <Link
            href="/book-a-coach"
            className="mt-5 rounded-lg bg-orange py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Book a mock interview
          </Link>
        </div>
      </div>

      {featured && <FeaturedCourse course={featured} />}
    </div>
  );
}
