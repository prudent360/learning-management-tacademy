import { Skeleton, SkeletonStatRow } from "@/components/skeletons/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="rounded-2xl bg-navy px-6 py-8 md:px-8 md:py-10">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-3 w-56" />
      </div>

      <SkeletonStatRow count={4} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-5 md:p-6">
            <Skeleton className="mb-4 h-4 w-28" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
