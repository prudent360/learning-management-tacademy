import { Skeleton, SkeletonHeader, SkeletonStatRow, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function AdminEnrollmentsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader withAction />
      <SkeletonStatRow count={4} />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-6">
        <SkeletonListRows count={8} />
      </div>
    </div>
  );
}
