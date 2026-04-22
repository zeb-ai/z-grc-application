import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { QueryBuilder, TelemetryQueries } from "@/lib/telemetry-queries";
import type {
  HistogramDataPoint,
  MetricDataPoint,
  MetricDataResponse,
  MetricType,
} from "@/types/telemetry";

/**
 * GET /api/metrics/data
 * Get metric time-series data
 */
export const GET = withAuthRequired(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    const metric_name = searchParams.get("metric_name");
    const type = searchParams.get("type") as MetricType | null;

    if (!metric_name || !type) {
      return NextResponse.json(
        { error: "metric_name and type are required" },
        { status: 400 },
      );
    }

    const filters = {
      user_id: searchParams.get("user_id") || undefined,
      group_id: searchParams.get("group_id") || undefined,
      service: searchParams.get("service") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    };

    const limit = Number.parseInt(searchParams.get("limit") || "1000");

    // Build filter string
    const filterConditions = QueryBuilder.buildMetricFilters(filters);

    let data_points: MetricDataPoint[] | HistogramDataPoint[] = [];
    let query = "";

    // Select appropriate query based on type
    switch (type) {
      case "gauge":
        query = TelemetryQueries.metrics.data.gauges;
        break;
      case "sum":
        query = TelemetryQueries.metrics.data.sums;
        break;
      case "histogram":
        query = TelemetryQueries.metrics.data.histograms;
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported metric type: ${type}` },
          { status: 400 },
        );
    }

    // Replace placeholders
    query = QueryBuilder.replaceParams(query, {
      metric_name,
      limit,
    }).replace("{filters}", filterConditions);

    if (type === "histogram") {
      // Query histogram data
      const result = await clickhouseClient.query<{
        timestamp: string;
        count: string;
        sum: string;
        bucket_counts: number[];
        explicit_bounds: number[];
        min: string;
      }>(query);

      data_points = result.map((row) => ({
        timestamp: row.timestamp,
        count: Number.parseInt(row.count),
        sum: Number.parseFloat(row.sum),
        bucket_counts: row.bucket_counts,
        explicit_bounds: row.explicit_bounds,
        min: row.min ? Number.parseFloat(row.min) : undefined,
      }));
    } else {
      // Query gauge/sum data
      const result = await clickhouseClient.query<{
        timestamp: string;
        value: string;
        attributes: Record<string, string>;
      }>(query);

      data_points = result.map((row) => ({
        timestamp: row.timestamp,
        value: Number.parseFloat(row.value),
        attributes: row.attributes,
      }));
    }

    const response: MetricDataResponse = {
      metric_name,
      type,
      data_points,
      total: data_points.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch metric data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metric data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
