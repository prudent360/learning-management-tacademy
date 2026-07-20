import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { FeaturedCourse } from "@/components/FeaturedCourse";
import { aptitudeCategories } from "@/lib/aptitude-categories";
import { getCourse } from "@/lib/courses-server";

const difficultyStyle: Record<string, string> = {
  Beginner: "bg-green-100 text-brand-green",
  Intermediate: "bg-orange-50 text-orange-600",
  Advanced: "bg-navy-50 text-navy",
};

export default async function AptitudePage() {
  const featured = await getCourse("aptitude-engine");
  const totalQuestions = aptitudeCategories.reduce((s, c) => s + c.questions, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice Exams"
        subtitle="Practice the reasoning tests employers use to shortlist candidates."
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Test categories" value={`${aptitudeCategories.length}`} />
        <Stat label="Practice questions" value={`${totalQuestions}`} />
        <Stat label="Avg. completion" value="18 min" />
        <Stat label="Your best score" value="80%" />
      </div>

      {/* Categories */}
      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Reasoning categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {aptitudeCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/aptitude/practice-exam?category=${cat.name.toLowerCase().replace(/ /g, "-")}`}
                className="group flex flex-col rounded-xl border border-line bg-surface p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy-50 text-navy">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyStyle[cat.difficulty]}`}
                  >
                    {cat.difficulty}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800">{cat.name}</h3>
                <p className="mt-1 flex-1 text-xs text-muted">{cat.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">{cat.questions} questions</span>
                  <span className="font-semibold text-orange group-hover:underline">
                    Start practice
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {featured && <FeaturedCourse course={featured} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
