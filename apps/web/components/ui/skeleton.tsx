import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-800/50', className)}
      {...props}
    />
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('lab-panel p-6 space-y-4', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

function TestCardSkeleton() {
  return (
    <div className="lab-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-10 w-2/3" />
      </div>

      {/* Privacy score skeleton */}
      <div className="lab-panel p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-24" />
          </div>
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      </div>

      {/* Test cards skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <TestCardSkeleton />
        <TestCardSkeleton />
        <TestCardSkeleton />
      </div>

      {/* Bottom section skeleton */}
      <div className="grid gap-6 xl:grid-cols-3">
        <CardSkeleton className="h-64" />
        <CardSkeleton className="h-64" />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-700">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main result */}
      <div className="lab-panel p-8 text-center">
        <Skeleton className="h-4 w-32 mx-auto mb-4" />
        <Skeleton className="h-16 w-48 mx-auto" />
      </div>

      {/* Details grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Additional info */}
      <CardSkeleton className="h-48" />
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  TestCardSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  ResultSkeleton,
};
