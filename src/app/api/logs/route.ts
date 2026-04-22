import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { QueryBuilder, TelemetryQueries } from "@/lib/telemetry-queries";
import type { Log, LogSeverity, LogsResponse } from "@/types/telemetry";

/**
 * GET /api/logs
 * List logs with filtering and pagination
 */
export const GET = withAuthRequired(async (request: NextRequest, _context) => {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      user_id: searchParams.get("user_id") || undefined,
      group_id: searchParams.get("group_id") || undefined,
      service: searchParams.get("service") || undefined,
      severity: searchParams.get("severity") || undefined,
      search: searchParams.get("search") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    };

    const limit = Number.parseInt(searchParams.get("limit") || "100");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // Build filter string
    const filterConditions = QueryBuilder.buildLogFilters(filters);

    // Build and execute list query
    const listQuery = TelemetryQueries.logs.list
      .replace("{filters}", filterConditions)
      .replace("{limit}", String(limit))
      .replace("{offset}", String(offset));

    const logsResult = await clickhouseClient.query<{
      timestamp: string;
      trace_id: string;
      span_id: string;
      severity: string;
      severity_number: string;
      service_name: string;
      body: string;
      resource_attributes: Record<string, string>;
      log_attributes: Record<string, string>;
    }>(listQuery);

    const logs: Log[] = logsResult.map((row) => ({
      timestamp: row.timestamp,
      trace_id: row.trace_id,
      span_id: row.span_id,
      severity: row.severity as LogSeverity,
      severity_number: Number.parseInt(row.severity_number),
      service_name: row.service_name,
      body: row.body,
      resource_attributes: row.resource_attributes,
      log_attributes: row.log_attributes,
      user_id: row.resource_attributes?.user_id,
      group_id: row.resource_attributes?.group_id,
    }));

    // Build and execute count query
    const countQuery = TelemetryQueries.logs.count.replace(
      "{filters}",
      filterConditions,
    );

    const countResult = await clickhouseClient.query<{ total: string }>(
      countQuery,
    );
    const total = Number.parseInt(countResult[0]?.total || "0");

    const response: LogsResponse = {
      logs,
      total,
      limit,
      offset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch logs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
