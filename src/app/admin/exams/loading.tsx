import { SkeletonHeader, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function AdminExamsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <SkeletonListRows count={6} />
      </div>
    </div>
  );
}
