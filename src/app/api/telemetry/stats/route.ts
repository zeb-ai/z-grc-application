import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { TelemetryQueries } from "@/lib/telemetry-queries";
import type { TelemetryStats } from "@/types/telemetry";

/**
 * GET /api/telemetry/stats
 * Get telemetry overview statistics
 */
export const GET = withAuthRequired(async (_request: NextRequest) => {
  try {
    // Total traces
    const totalTracesResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.stats.totalTraces,
    );
    const total_traces = Number.parseInt(totalTracesResult[0]?.count || "0");

    // Total spans
    const totalSpansResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.stats.totalSpans,
    );
    const total_spans = Number.parseInt(totalSpansResult[0]?.count || "0");

    // Average duration
    const avgDurationResult = await clickhouseClient.query<{
      avg_duration: string;
    }>(TelemetryQueries.stats.avgDuration);
    const avg_duration_ms = Number.parseFloat(
      avgDurationResult[0]?.avg_duration || "0",
    );

    // Error rate
    const errorRateResult = await clickhouseClient.query<{
      error_rate: string;
    }>(TelemetryQueries.stats.errorRate);
    const error_rate = Number.parseFloat(errorRateResult[0]?.error_rate || "0");

    // Requests per minute
    const rpmResult = await clickhouseClient.query<{ rpm: string }>(
      TelemetryQueries.stats.requestsPerMinute,
    );
    const requests_per_minute = Number.parseFloat(rpmResult[0]?.rpm || "0");

    // Top services
    const topServicesResult = await clickhouseClient.query<{
      name: string;
      count: string;
    }>(TelemetryQueries.stats.topServices);
    const top_services = topServicesResult.map((row) => ({
      name: row.name,
      count: Number.parseInt(row.count),
    }));

    // Top endpoints
    const topEndpointsResult = await clickhouseClient.query<{
      name: string;
      count: string;
      avg_duration: string;
    }>(TelemetryQueries.stats.topEndpoints);
    const top_endpoints = topEndpointsResult.map((row) => ({
      name: row.name,
      count: Number.parseInt(row.count),
      avg_duration_ms: Number.parseFloat(row.avg_duration),
    }));

    const stats: TelemetryStats = {
      total_traces,
      total_spans,
      avg_duration_ms,
      error_rate,
      requests_per_minute,
      top_services,
      top_endpoints,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch telemetry stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch telemetry stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
