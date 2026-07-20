import { Skeleton, SkeletonHeader, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />

      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <div className="flex items-end justify-center gap-4">
          <Skeleton className="h-28 w-24 rounded-xl" />
          <Skeleton className="h-36 w-24 rounded-xl" />
          <Skeleton className="h-24 w-24 rounded-xl" />
        </div>
        <div className="mt-6">
          <SkeletonListRows count={6} />
        </div>
      </div>
    </div>
  );
}
