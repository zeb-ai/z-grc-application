import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { TelemetryQueries } from "@/lib/telemetry-queries";
import type { MetricsStats, MetricType } from "@/types/telemetry";

/**
 * GET /api/metrics/stats
 * Get metrics overview statistics
 */
export const GET = withAuthRequired(async (_request: NextRequest) => {
  try {
    // Count by type
    const gaugesResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.metrics.stats.totalGauges,
    );
    const gauges = Number.parseInt(gaugesResult[0]?.count || "0");

    const sumsResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.metrics.stats.totalSums,
    );
    const sums = Number.parseInt(sumsResult[0]?.count || "0");

    const histogramsResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.metrics.stats.totalHistograms,
    );
    const histograms = Number.parseInt(histogramsResult[0]?.count || "0");

    const summariesResult = await clickhouseClient.query<{ count: string }>(
      TelemetryQueries.metrics.stats.totalSummaries,
    );
    const summaries = Number.parseInt(summariesResult[0]?.count || "0");

    const by_type = [
      { type: "gauge" as MetricType, count: gauges },
      { type: "sum" as MetricType, count: sums },
      { type: "histogram" as MetricType, count: histograms },
      { type: "summary" as MetricType, count: summaries },
    ].filter((item) => item.count > 0);

    const total_metrics = gauges + sums + histograms + summaries;

    // Data points per minute
    const dpmResult = await clickhouseClient.query<{ dpm: string }>(
      TelemetryQueries.metrics.stats.dataPointsPerMinute,
    );
    const data_points_per_minute = Number.parseFloat(dpmResult[0]?.dpm || "0");

    // Get top metrics from list
    const gaugesList = await clickhouseClient.query<{
      name: string;
      count: string;
    }>(TelemetryQueries.metrics.list.gauges);
    const sumsList = await clickhouseClient.query<{
      name: string;
      count: string;
    }>(TelemetryQueries.metrics.list.sums);
    const histogramsList = await clickhouseClient.query<{
      name: string;
      count: string;
    }>(TelemetryQueries.metrics.list.histograms);

    const top_metrics = [
      ...gaugesList.map((row) => ({
        name: row.name,
        type: "gauge" as MetricType,
        count: Number.parseInt(row.count),
      })),
      ...sumsList.map((row) => ({
        name: row.name,
        type: "sum" as MetricType,
        count: Number.parseInt(row.count),
      })),
      ...histogramsList.map((row) => ({
        name: row.name,
        type: "histogram" as MetricType,
        count: Number.parseInt(row.count),
      })),
    ]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats: MetricsStats = {
      total_metrics,
      by_type,
      top_metrics,
      data_points_per_minute,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch metrics stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metrics stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});