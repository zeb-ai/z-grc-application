import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { QueryBuilder, TelemetryQueries } from "@/lib/telemetry-queries";
import type { Trace, TracesResponse } from "@/types/telemetry";

/**
 * GET /api/telemetry/traces
 * List traces with filtering and pagination
 */
export const GET = withAuthRequired(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      user_id: searchParams.get("user_id") || undefined,
      group_id: searchParams.get("group_id") || undefined,
      service: searchParams.get("service") || undefined,
      status: searchParams.get("status") || undefined,
      min_duration: searchParams.get("min_duration")
        ? Number.parseFloat(searchParams.get("min_duration")!)
        : undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    };

    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // Build filter string
    const filterConditions = QueryBuilder.buildTraceFilters(filters);

    // Build and execute list query
    const listQuery = TelemetryQueries.traces.list
      .replace("{filters}", filterConditions)
      .replace("{limit}", String(limit))
      .replace("{offset}", String(offset));

    const tracesResult = await clickhouseClient.query<{
      trace_id: string;
      timestamp: string;
      root_span_name: string;
      service_name: string;
      duration_ms: string;
      span_count: string;
      user_id?: string;
      group_id?: string;
      status: string;
    }>(listQuery);

    const traces: Trace[] = tracesResult.map((row) => ({
      trace_id: row.trace_id,
      timestamp: row.timestamp,
      root_span_name: row.root_span_name,
      service_name: row.service_name,
      duration_ms: Number.parseFloat(row.duration_ms),
      span_count: Number.parseInt(row.span_count),
      user_id: row.user_id,
      group_id: row.group_id,
      status: row.status as "SUCCESS" | "ERROR" | "UNSET",
    }));

    // Build and execute count query
    const countQuery = TelemetryQueries.traces.count.replace(
      "{filters}",
      filterConditions,
    );

    const countResult = await clickhouseClient.query<{ total: string }>(
      countQuery,
    );
    const total = Number.parseInt(countResult[0]?.total || "0");

    const response: TracesResponse = {
      traces,
      total,
      limit,
      offset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch traces:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch traces",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});