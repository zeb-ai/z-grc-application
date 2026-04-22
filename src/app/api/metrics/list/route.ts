import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { TelemetryQueries } from "@/lib/telemetry-queries";
import type {
  MetricInfo,
  MetricsListResponse,
  MetricType,
} from "@/types/telemetry";

/**
 * GET /api/metrics/list
 * List all available metrics
 */
export const GET = withAuthRequired(async (_request: NextRequest) => {
  try {
    const allMetrics: MetricInfo[] = [];

    // Query gauges
    const gaugesResult = await clickhouseClient.query<{
      name: string;
      type: string;
      description: string;
      unit: string;
      count: string;
    }>(TelemetryQueries.metrics.list.gauges);

    for (const row of gaugesResult) {
      allMetrics.push({
        name: row.name,
        type: row.type as MetricType,
        description: row.description,
        unit: row.unit,
        count: Number.parseInt(row.count),
      });
    }

    // Query sums
    const sumsResult = await clickhouseClient.query<{
      name: string;
      type: string;
      description: string;
      unit: string;
      count: string;
    }>(TelemetryQueries.metrics.list.sums);

    for (const row of sumsResult) {
      allMetrics.push({
        name: row.name,
        type: row.type as MetricType,
        description: row.description,
        unit: row.unit,
        count: Number.parseInt(row.count),
      });
    }

    // Query histograms
    const histogramsResult = await clickhouseClient.query<{
      name: string;
      type: string;
      description: string;
      unit: string;
      count: string;
    }>(TelemetryQueries.metrics.list.histograms);

    for (const row of histogramsResult) {
      allMetrics.push({
        name: row.name,
        type: row.type as MetricType,
        description: row.description,
        unit: row.unit,
        count: Number.parseInt(row.count),
      });
    }

    // Query summaries
    const summariesResult = await clickhouseClient.query<{
      name: string;
      type: string;
      description: string;
      unit: string;
      count: string;
    }>(TelemetryQueries.metrics.list.summaries);

    for (const row of summariesResult) {
      allMetrics.push({
        name: row.name,
        type: row.type as MetricType,
        description: row.description,
        unit: row.unit,
        count: Number.parseInt(row.count),
      });
    }

    const response: MetricsListResponse = {
      metrics: allMetrics,
      total: allMetrics.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch metrics list:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metrics list",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
