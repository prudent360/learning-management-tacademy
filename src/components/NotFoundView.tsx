import Link from "next/link";
import { CompassIcon } from "@/components/icons";

export function NotFoundView({
  homeHref = "/",
  homeLabel = "Go home",
  fullScreen = false,
}: {
  homeHref?: string;
  homeLabel?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-6 text-center ${
        fullScreen ? "min-h-screen" : "min-h-[50vh]"
      }`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-50 text-navy">
        <CompassIcon className="h-7 w-7" />
      </span>
      <div>
        <p className="text-3xl font-extrabold text-slate-800">404</p>
        <h2 className="mt-1 text-lg font-bold text-slate-800">Page not found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link
        href={homeHref}
        className="mt-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
