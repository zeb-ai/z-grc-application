import { type NextRequest, NextResponse } from "next/server";
import { withAuthRequired } from "@/lib/auth-middleware";
import { clickhouseClient } from "@/clickhouse/client";

export const GET = withAuthRequired<any>(async (request: NextRequest, _context) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const isClickHouseAvailable = await clickhouseClient.ping();

    if (!isClickHouseAvailable) {
      return NextResponse.json([]);
    }

    const query = `
      SELECT
        ServiceName as service_name,
        countIf(StatusCode = 'STATUS_CODE_ERROR') as total_errors,
        count() as total_requests,
        (countIf(StatusCode = 'STATUS_CODE_ERROR') / count()) * 100 as error_rate,
        max(Timestamp) as last_error_time
      FROM otel_traces
      WHERE Timestamp >= now() - INTERVAL 24 HOUR
        AND SpanKind = 'SPAN_KIND_SERVER'
      GROUP BY ServiceName
      HAVING total_errors > 0
      ORDER BY total_errors DESC
      LIMIT ${limit}
    `;

    const results = await clickhouseClient.query<{
      service_name: string;
      total_errors: string;
      total_requests: string;
      error_rate: number;
      last_error_time: string;
    }>(query);

    const applicationErrors = results.map((row) => ({
      serviceName: row.service_name,
      totalErrors: parseInt(row.total_errors, 10),
      errorRate: parseFloat(row.error_rate.toFixed(2)),
      lastErrorTime: new Date(row.last_error_time),
      totalRequests: parseInt(row.total_requests, 10),
    }));

    return NextResponse.json(applicationErrors);
  } catch (error) {
    console.error("Failed to fetch application errors:", error);
    return NextResponse.json([]);
  }
});