import {
  Skeleton,
  SkeletonStatRow,
  SkeletonChart,
  SkeletonTable,
} from "@/components/skeletons/Skeleton";

export default function PerformanceLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-navy px-6 py-3.5">
        <Skeleton className="h-4 w-52" />
      </div>

      <SkeletonStatRow count={4} />

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-1.5 h-3 w-64" />
        <div className="mt-4">
          <SkeletonChart height="h-72" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="mt-3 h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3">
          <SkeletonTable rows={6} cols={4} />
        </div>
      </div>
    </div>
  );
}
