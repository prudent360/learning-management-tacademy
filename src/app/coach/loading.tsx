import { Skeleton, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function CoachBookingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-20" />
        <SkeletonListRows count={3} />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-16" />
        <SkeletonListRows count={2} />
      </div>
    </div>
  );
}
