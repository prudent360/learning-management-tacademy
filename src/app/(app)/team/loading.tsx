import { SkeletonHeader, SkeletonCardGrid } from "@/components/skeletons/Skeleton";

export default function TeamLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonCardGrid count={6} cols="sm:grid-cols-2 xl:grid-cols-3" cardHeight="h-48" />
    </div>
  );
}
