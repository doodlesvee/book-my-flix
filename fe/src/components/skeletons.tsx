import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MovieDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Banner */}
      <Skeleton className="h-72 w-full rounded-xl md:h-96" />
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {/* Poster */}
        <Skeleton className="h-80 w-56 shrink-0 rounded-lg" />
        {/* Info */}
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShowtimeSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function SeatGridSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-3 py-8">
      {Array.from({ length: 8 }).map((_, row) => (
        <div key={row} className="flex justify-center gap-1.5">
          {Array.from({ length: 12 }).map((_, col) => (
            <Skeleton key={col} className="size-7 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
