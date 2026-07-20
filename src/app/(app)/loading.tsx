import { SkeletonHeader, SkeletonStatRow, SkeletonCardGrid } from "@/components/skeletons/Skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonStatRow count={4} />
      <SkeletonCardGrid count={6} />
    </div>
  );
}
