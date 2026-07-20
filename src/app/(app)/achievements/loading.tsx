import { Skeleton, SkeletonHeader } from "@/components/skeletons/Skeleton";

export default function AchievementsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center gap-5 rounded-2xl bg-surface p-6">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-2 w-full max-w-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-12" />
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-12" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface-muted p-4">
              <Skeleton className="mx-auto h-10 w-10 rounded-full" />
              <Skeleton className="mx-auto mt-3 h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
