import { CheckCircleIcon, GraduationIcon } from "@/components/icons";

const FEATURES = [
  "Structured, exam-focused courses",
  "Timed practice exams with real scoring",
  "1:1 coaching sessions with real experts",
];

export function AuthSplitLayout({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-navy-600/50 blur-3xl" />

        <div className="relative z-10 flex items-center gap-1.5 select-none">
          <span className="text-xl font-extrabold tracking-tight text-white">TEK</span>
          <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-orange">
            <GraduationIcon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-orange">SKILL</span>
          <span className="text-xl font-extrabold tracking-tight text-white">UP</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white">{heading}</h2>
          <p className="mt-3 text-base text-white/70">{subheading}</p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/90">
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-orange" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          &copy; {new Date().getFullYear()} TekSkillUp. All rights reserved.
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-background p-4">{children}</div>
    </div>
  );
}
