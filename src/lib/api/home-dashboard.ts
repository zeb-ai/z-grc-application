import type {
  DashboardStats,
  SystemHealth,
  ActivityItem,
  CostDistributionData,
  RequestVolumeData,
  ErrorRateData,
  LogDistribution,
  TimeRangeFilter,
} from "@/types/dashboard";

// Helper to convert time range to timestamp
function getTimeRangeTimestamps(filter: TimeRangeFilter): {
  startTime: number;
  endTime: number;
} {
  const endTime = filter.endDate
    ? filter.endDate.getTime()
    : new Date().getTime();
  let startTime: number;

  switch (filter.range) {
    case "1h":
      startTime = endTime - 60 * 60 * 1000;
      break;
    case "24h":
      startTime = endTime - 24 * 60 * 60 * 1000;
      break;
    case "7d":
      startTime = endTime - 7 * 24 * 60 * 60 * 1000;
      break;
    case "30d":
      startTime = endTime - 30 * 24 * 60 * 60 * 1000;
      break;
    case "custom":
      startTime = filter.startDate
        ? filter.startDate.getTime()
        : endTime - 24 * 60 * 60 * 1000;
      break;
    default:
      startTime = endTime - 24 * 60 * 60 * 1000;
  }

  return { startTime, endTime };
}

// Fetch dashboard statistics
export async function fetchDashboardStats(
  filter: TimeRangeFilter,
): Promise<DashboardStats> {
  const { startTime, endTime } = getTimeRangeTimestamps(filter);

  try {
    const [
      groupsRes,
      apiKeysRes,
      telemetryRes,
      logsRes,
    ] = await Promise.allSettled([
      fetch("/api/groups"),
      fetch("/api/apikey"),
      fetch(
        `/api/telemetry/stats?start_time=${startTime}&end_time=${endTime}`,
      ),
      fetch(`/api/logs/stats?start_time=${startTime}&end_time=${endTime}`),
    ]);

    // Parse responses
    const groups =
      groupsRes.status === "fulfilled" ? await groupsRes.value.json() : null;
    const apiKeys =
      apiKeysRes.status === "fulfilled" ? await apiKeysRes.value.json() : null;
    const telemetry =
      telemetryRes.status === "fulfilled"
        ? await telemetryRes.value.json()
        : null;
    const logs =
      logsRes.status === "fulfilled" ? await logsRes.value.json() : null;

    // Calculate total cost consumed (would need a dedicated endpoint in real scenario)
    // For now, we'll use a placeholder
    const totalCostConsumed = 0; // TODO: Implement quota aggregation endpoint

    return {
      totalGroups: groups?.groups?.length || 0,
      activeApiKeys: apiKeys?.keys?.length || 0,
      totalCostConsumed,
      requestsPerMinute: telemetry?.rpm || 0,
      errorRate: telemetry?.error_rate || 0,
      avgResponseTime: telemetry?.avg_duration || 0,
      totalTraces: telemetry?.total_traces || 0,
      logsPerMinute: logs?.logs_per_minute || 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw error;
  }
}

// Fetch system health
export async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const [readinessRes, telemetryRes] = await Promise.allSettled([
      fetch("/api/readiness"),
      fetch("/api/telemetry/stats"),
    ]);

    const readiness =
      readinessRes.status === "fulfilled"
        ? await readinessRes.value.json()
        : null;
    const telemetry =
      telemetryRes.status === "fulfilled"
        ? await telemetryRes.value.json()
        : null;

    const avgResponseTime = telemetry?.avg_duration || 0;
    const errorRate = telemetry?.error_rate || 0;

    return {
      apiResponseTime: {
        name: "API Response Time",
        value: avgResponseTime,
        unit: "ms",
        status:
          avgResponseTime > 1000
            ? "critical"
            : avgResponseTime > 500
              ? "warning"
              : "healthy",
        threshold: { warning: 500, critical: 1000 },
      },
      errorRate: {
        name: "Error Rate",
        value: errorRate,
        unit: "%",
        status:
          errorRate > 5 ? "critical" : errorRate > 1 ? "warning" : "healthy",
        threshold: { warning: 1, critical: 5 },
      },
      databaseConnection: {
        name: "Database",
        value: readiness?.database?.connected ? 100 : 0,
        unit: "%",
        status: readiness?.database?.connected ? "healthy" : "critical",
      },
      clickhouseConnection: {
        name: "ClickHouse",
        value: readiness?.clickhouse?.connected ? 100 : 0,
        unit: "%",
        status: readiness?.clickhouse?.connected ? "healthy" : "critical",
      },
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Failed to fetch system health:", error);
    throw error;
  }
}

// Fetch recent activity (simulated for now - would need dedicated endpoint)
export async function fetchRecentActivity(
  limit: number = 10,
): Promise<ActivityItem[]> {
  try {
    // In a real implementation, this would call a dedicated activity log endpoint
    // For now, we'll return mock data structure
    const activities: ActivityItem[] = [];

    // Fetch recent groups
    const groupsRes = await fetch("/api/groups");
    if (groupsRes.ok) {
      const { groups } = await groupsRes.json();
      groups?.slice(0, 3).forEach((group: any) => {
        activities.push({
          id: `group-${group.group_id}`,
          type: "group_created",
          title: "Group Created",
          description: `Group "${group.name}" was created`,
          timestamp: new Date(group.created_at),
          severity: "success",
          link: `/user-groups/${group.group_id}`,
        });
      });
    }

    // Fetch recent API keys
    const apiKeysRes = await fetch("/api/apikey");
    if (apiKeysRes.ok) {
      const { keys } = await apiKeysRes.json();
      keys?.slice(0, 3).forEach((key: any) => {
        activities.push({
          id: `key-${key.id}`,
          type: "apikey_generated",
          title: "API Key Generated",
          description: `Key "${key.name}" was generated`,
          timestamp: new Date(key.created_at),
          severity: "info",
          link: "/api-keys",
        });
      });
    }

    // Sort by timestamp (most recent first)
    activities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return activities.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return [];
  }
}

// Fetch cost distribution by group
export async function fetchCostDistribution(): Promise<
  CostDistributionData[]
> {
  try {
    const groupsRes = await fetch("/api/groups");
    if (!groupsRes.ok) {
      throw new Error("Failed to fetch groups");
    }

    const { groups } = await groupsRes.json();

    // Calculate cost distribution
    const distribution: CostDistributionData[] = groups.map((group: any) => {
      const totalCost = parseFloat(group.default_cost_limit || "0");
      const usedCost = group.members?.reduce(
        (sum: number, member: any) =>
          sum + parseFloat(member.quota?.used_cost || "0"),
        0,
      ) || 0;

      return {
        groupId: group.group_id,
        groupName: group.name,
        totalCost,
        usedCost,
        percentage: totalCost > 0 ? (usedCost / totalCost) * 100 : 0,
      };
    });

    // Sort by used cost (highest first)
    return distribution.sort((a, b) => b.usedCost - a.usedCost).slice(0, 5);
  } catch (error) {
    console.error("Failed to fetch cost distribution:", error);
    return [];
  }
}

// Fetch request volume trend
export async function fetchRequestVolume(
  filter: TimeRangeFilter,
): Promise<RequestVolumeData> {
  try {
    const { startTime, endTime } = getTimeRangeTimestamps(filter);

    // This would need a time-series endpoint in real implementation
    // For now, we'll use telemetry stats
    const res = await fetch(
      `/api/telemetry/stats?start_time=${startTime}&end_time=${endTime}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch request volume");
    }

    const data = await res.json();

    // Generate simulated time series (would be real data from backend)
    const timeSeries = [];
    const points = 20;
    const interval = (endTime - startTime) / points;

    for (let i = 0; i < points; i++) {
      timeSeries.push({
        timestamp: new Date(startTime + i * interval),
        value: Math.random() * 100 + (data.rpm || 0) * 0.8,
      });
    }

    return {
      timeSeries,
      total: data.total_traces || 0,
      peak: Math.max(...timeSeries.map((p) => p.value)),
      average: data.rpm || 0,
    };
  } catch (error) {
    console.error("Failed to fetch request volume:", error);
    return { timeSeries: [], total: 0, peak: 0, average: 0 };
  }
}

// Fetch error rate trend
export async function fetchErrorRate(
  filter: TimeRangeFilter,
): Promise<ErrorRateData> {
  try {
    const { startTime, endTime } = getTimeRangeTimestamps(filter);

    const res = await fetch(
      `/api/telemetry/stats?start_time=${startTime}&end_time=${endTime}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch error rate");
    }

    const data = await res.json();

    // Generate simulated time series
    const timeSeries = [];
    const points = 20;
    const interval = (endTime - startTime) / points;

    for (let i = 0; i < points; i++) {
      timeSeries.push({
        timestamp: new Date(startTime + i * interval),
        value: Math.random() * 5 + (data.error_rate || 0) * 0.8,
      });
    }

    return {
      timeSeries,
      currentRate: data.error_rate || 0,
      incidents: Math.floor(
        ((data.total_spans || 0) * (data.error_rate || 0)) / 100,
      ),
    };
  } catch (error) {
    console.error("Failed to fetch error rate:", error);
    return { timeSeries: [], currentRate: 0, incidents: 0 };
  }
}

// Fetch log severity distribution
export async function fetchLogDistribution(
  filter: TimeRangeFilter,
): Promise<LogDistribution> {
  try {
    const { startTime, endTime } = getTimeRangeTimestamps(filter);

    const res = await fetch(
      `/api/logs/stats?start_time=${startTime}&end_time=${endTime}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch log distribution");
    }

    const statsData = await res.json();
    const severityData = statsData.by_severity || {};
    const total = statsData.total_logs || 0;

    const colors: Record<string, string> = {
      TRACE: "#6B7280",
      DEBUG: "#3B82F6",
      INFO: "#10B981",
      WARN: "#F59E0B",
      ERROR: "#EF4444",
      FATAL: "#991B1B",
    };

    const data = Object.entries(severityData).map(([severity, count]) => ({
      severity: severity as any,
      count: count as number,
      percentage: total > 0 ? ((count as number) / total) * 100 : 0,
      color: colors[severity] || "#6B7280",
    }));

    const errorCount = (severityData.ERROR || 0) + (severityData.FATAL || 0);
    const errorPercentage = total > 0 ? (errorCount / total) * 100 : 0;

    return {
      data,
      total,
      errorPercentage,
    };
  } catch (error) {
    console.error("Failed to fetch log distribution:", error);
    return { data: [], total: 0, errorPercentage: 0 };
  }
}