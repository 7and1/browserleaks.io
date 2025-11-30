import { DashboardSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-16 bg-slate-900/50 min-h-screen" />

        {/* Main content */}
        <div className="flex-1">
          {/* Status bar skeleton */}
          <div className="h-12 bg-slate-900/50 border-b border-slate-800" />

          {/* Content area */}
          <div className="p-6 lg:p-10">
            <DashboardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
