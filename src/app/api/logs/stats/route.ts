import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { TelemetryQueries } from "@/lib/telemetry-queries";
import type { LogsStats, LogSeverity } from "@/types/telemetry";

/**
 * GET /api/logs/stats
 * Get logs overview statistics
 */
export const GET = withAuthRequired(async (_request: NextRequest) => {
  try {
    // Total logs
    const totalLogsResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.logs.stats.totalLogs,
    );
    const total_logs = Number.parseInt(totalLogsResult[0]?.count || "0");

    // Logs per minute
    const lpmResult = await clickhouseClient.query<{ lpm: string }>(
      TelemetryQueries.logs.stats.logsPerMinute,
    );
    const logs_per_minute = Number.parseFloat(lpmResult[0]?.lpm || "0");

    // By severity
    const bySeverityResult = await clickhouseClient.query<{
      severity: string;
      count: string;
    }>(TelemetryQueries.logs.stats.bySeverity);
    const by_severity = bySeverityResult.map((row) => ({
      severity: row.severity as LogSeverity,
      count: Number.parseInt(row.count),
    }));

    // Top services
    const topServicesResult = await clickhouseClient.query<{
      name: string;
      count: string;
    }>(TelemetryQueries.logs.stats.topServices);
    const top_services = topServicesResult.map((row) => ({
      name: row.name,
      count: Number.parseInt(row.count),
    }));

    // Error rate
    const errorRateResult = await clickhouseClient.query<{
      error_rate: string;
    }>(TelemetryQueries.logs.stats.errorRate);
    const error_rate = Number.parseFloat(
      errorRateResult[0]?.error_rate || "0",
    );

    const stats: LogsStats = {
      total_logs,
      logs_per_minute,
      by_severity,
      top_services,
      error_rate,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch logs stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch logs stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});