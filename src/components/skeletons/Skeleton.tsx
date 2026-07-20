/** Base shimmer block. Compose with width/height utility classes. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

/** Mirrors PageHeader's navy banner shape (title + optional subtitle + action). */
export function SkeletonHeader({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-navy px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      {withAction && <Skeleton className="h-9 w-28 shrink-0" />}
    </div>
  );
}

/** A row of stat-tile skeletons, matching the StatCard/stat-tile pattern used across dashboards. */
export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-6 w-14" />
        </div>
      ))}
    </div>
  );
}

/** Rows of avatar + two text lines + trailing badge, matching list-style admin/detail pages. */
export function SkeletonListRows({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-line p-4 sm:gap-4"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** A grid of generic content cards (course cards, coach cards, badge tiles, category cards). */
export function SkeletonCardGrid({
  count = 6,
  cols = "sm:grid-cols-2 xl:grid-cols-3",
  cardHeight = "h-56",
}: {
  count?: number;
  cols?: string;
  cardHeight?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`overflow-hidden rounded-2xl border border-line bg-surface ${cardHeight}`}>
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A simple table skeleton: header row + N body rows. */
export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-line pb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-line/60 pb-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A chart-shaped placeholder for pages with data visualizations. */
export function SkeletonChart({ height = "h-72" }: { height?: string }) {
  return (
    <div className={`relative w-full overflow-hidden rounded-xl ${height}`}>
      <Skeleton className="absolute inset-0 rounded-xl" />
    </div>
  );
}
