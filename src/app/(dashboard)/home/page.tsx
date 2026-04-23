"use client";

import { Shield, DollarSign } from "lucide-react";
import { StatCard } from "./components/StatCard";
import { TopCostUsageTable } from "./components/TopCostUsageTable";
import { ApplicationErrorsTable } from "./components/ApplicationErrorsTable";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { useTopCostUsage } from "@/hooks/useTopCostUsage";
import { useApplicationErrors } from "@/hooks/useApplicationErrors";

export default function HomePage() {
  const { stats, loading: statsLoading } = useDashboardOverview(30000);
  const { data: costData, loading: costLoading } = useTopCostUsage(10, 60000);
  const { data: errorData, loading: errorLoading } = useApplicationErrors(10, 60000);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of user groups, cost usage, and application health
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total User Groups"
          value={stats?.totalGroups ?? 0}
          icon={<Shield className="h-4 w-4" />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Cost Spent"
          value={`$${stats?.totalCostSpent.toFixed(2) ?? "0.00"}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={statsLoading}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Top Cost Usage by User</h2>
        <TopCostUsageTable data={costData} loading={costLoading} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Applications with Most Errors</h2>
        <ApplicationErrorsTable data={errorData} loading={errorLoading} />
      </div>
    </div>
  );
}