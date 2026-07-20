import {
  Skeleton,
  SkeletonHeader,
  SkeletonTable,
  SkeletonListRows,
} from "@/components/skeletons/Skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-line bg-surface p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-5 w-10" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-56" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-56" />
        <SkeletonTable rows={6} cols={4} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-56" />
        <SkeletonListRows count={5} />
      </div>
    </div>
  );
}
