import { SkeletonHeader, SkeletonStatRow, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function AdminPaymentsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonStatRow count={4} />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <SkeletonListRows count={8} />
      </div>
    </div>
  );
}
