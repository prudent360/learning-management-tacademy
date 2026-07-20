import {
  Skeleton,
  SkeletonHeader,
  SkeletonStatRow,
  SkeletonCardGrid,
} from "@/components/skeletons/Skeleton";

export default function AptitudeLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonStatRow count={4} />
      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-48" />
        <SkeletonCardGrid count={6} cols="sm:grid-cols-2 xl:grid-cols-3" cardHeight="h-40" />
      </div>
    </div>
  );
}
