import { Suspense } from "react";
import StaysDashboard from "@/components/StaysDashboard";
import { buttonVariants } from "@/lib/button-variants";

function DashboardSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-4">
      <div className="h-64 rounded-xl bg-muted/50" />
      <div className="h-24 rounded-xl bg-muted/50" />
      <div className="h-24 rounded-xl bg-muted/50" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Your stays</h2>
        <a href="/dashboard/new" className={buttonVariants()}>
          + New stay
        </a>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <StaysDashboard />
      </Suspense>
    </div>
  );
}
