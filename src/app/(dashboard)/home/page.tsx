"use client";

import { useState } from "react";
import {
  Activity,
  Shield,
  Key,
  TrendingUp,
  Zap,
  Clock,
  Activity as ActivityIcon,
  FileText,
} from "lucide-react";
import { KpiCard } from "./components/KpiCard";
import { RecentActivityCard } from "./components/RecentActivityCard";
import { SystemHealthCard } from "./components/SystemHealthCard";
import { CostDistributionChart } from "./components/CostDistributionChart";
import { RequestVolumeChart } from "./components/RequestVolumeChart";
import { ErrorRateChart } from "./components/ErrorRateChart";
import { LogSeverityChart } from "./components/LogSeverityChart";
import { useHomeStats } from "@/hooks/useHomeStats";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useCostTrends } from "@/hooks/useCostTrends";
import type { TimeRange } from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Fetch all dashboard data
  const { stats, loading: statsLoading } = useHomeStats(
    { range: timeRange },
    30000, // Refresh every 30s
  );

  const { health, loading: healthLoading } = useSystemHealth(30000);

  const { activities, loading: activityLoading } = useRecentActivity(8, 60000);

  const {
    costDistribution,
    requestVolume,
    errorRate,
    logDistribution,
    loading: trendsLoading,
  } = useCostTrends({ range: timeRange }, 60000);

  // Calculate trends (mock for now - would need historical data API)
  const calculateTrend = () => ({
    value: Math.random() * 20 - 10,
    direction: Math.random() > 0.5 ? "up" : "down",
    period: "from last hour",
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      {/* Header with Time Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your governance engine in real-time
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last 1 hour</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Groups"
          value={stats?.totalGroups ?? 0}
          icon={Shield}
          trend={calculateTrend() as any}
          status="neutral"
          loading={statsLoading}
        />
        <KpiCard
          title="Active API Keys"
          value={stats?.activeApiKeys ?? 0}
          icon={Key}
          trend={calculateTrend() as any}
          status="success"
          loading={statsLoading}
        />
        <KpiCard
          title="Requests/Min"
          value={stats?.requestsPerMinute.toFixed(1) ?? "0"}
          icon={Activity}
          trend={calculateTrend() as any}
          status={
            (stats?.requestsPerMinute ?? 0) > 100
              ? "success"
              : (stats?.requestsPerMinute ?? 0) > 50
                ? "warning"
                : "neutral"
          }
          loading={statsLoading}
        />
        <KpiCard
          title="Error Rate"
          value={`${stats?.errorRate.toFixed(2) ?? "0"}%`}
          icon={TrendingUp}
          status={
            (stats?.errorRate ?? 0) > 5
              ? "danger"
              : (stats?.errorRate ?? 0) > 1
                ? "warning"
                : "success"
          }
          loading={statsLoading}
        />
      </div>

      {/* Second Row of KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Avg Response Time"
          value={stats?.avgResponseTime.toFixed(0) ?? "0"}
          unit="ms"
          icon={Clock}
          trend={calculateTrend() as any}
          status={
            (stats?.avgResponseTime ?? 0) > 1000
              ? "danger"
              : (stats?.avgResponseTime ?? 0) > 500
                ? "warning"
                : "success"
          }
          loading={statsLoading}
        />
        <KpiCard
          title="Total Traces"
          value={stats?.totalTraces ?? 0}
          icon={ActivityIcon}
          trend={calculateTrend() as any}
          status="neutral"
          loading={statsLoading}
        />
        <KpiCard
          title="Logs/Min"
          value={stats?.logsPerMinute.toFixed(1) ?? "0"}
          icon={FileText}
          trend={calculateTrend() as any}
          status="neutral"
          loading={statsLoading}
        />
        <KpiCard
          title="Cost Consumed"
          value={`$${stats?.totalCostConsumed.toFixed(2) ?? "0.00"}`}
          icon={Zap}
          trend={calculateTrend() as any}
          status="neutral"
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity - Left Side (60%) */}
        <div className="lg:col-span-4">
          <RecentActivityCard
            activities={activities}
            loading={activityLoading}
          />
        </div>

        {/* System Health - Right Side (40%) */}
        <div className="lg:col-span-3">
          <SystemHealthCard health={health} loading={healthLoading} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <CostDistributionChart
          data={costDistribution}
          loading={trendsLoading}
        />
        <RequestVolumeChart data={requestVolume} loading={trendsLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ErrorRateChart data={errorRate} loading={trendsLoading} />
        <LogSeverityChart data={logDistribution} loading={trendsLoading} />
      </div>
    </div>
  );
}