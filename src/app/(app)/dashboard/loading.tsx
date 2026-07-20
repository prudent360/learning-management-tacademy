import { Skeleton } from "@/components/skeletons/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="rounded-2xl border border-line bg-gradient-to-r from-navy to-navy-700 p-6 md:p-8">
        <Skeleton className="h-3 w-32 bg-white/10" />
        <Skeleton className="mt-3 h-7 w-64" />
        <Skeleton className="mt-2 h-3 w-80" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Resume learning */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-4 w-56" />
            <Skeleton className="mt-1 h-3 w-72" />
            <Skeleton className="mt-3 h-2 w-full max-w-md" />
          </div>

          {/* Learning path grid */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface p-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-1.5 h-3 w-1/2" />
                  <Skeleton className="mt-4 h-1.5 w-full" />
                  <Skeleton className="mt-4 h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-5 space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
