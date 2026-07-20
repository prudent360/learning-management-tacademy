import { Skeleton, SkeletonHeader, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader withAction />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-6">
        <SkeletonListRows count={8} />
      </div>
    </div>
  );
}
