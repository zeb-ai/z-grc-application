import { type NextRequest, NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { withAuthRequired } from "@/lib/auth-middleware";
import { parseStatus } from "@/lib/telemetry";
import { QueryBuilder, TelemetryQueries } from "@/lib/telemetry-queries";
import type { Span, SpanEvent, SpanLink, TraceDetail } from "@/types/telemetry";

/**
 * GET /api/telemetry/traces/[traceId]
 * Get detailed trace with all spans
 */
export const GET = withAuthRequired(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ traceId: string }> },
  ) => {
    try {
      const { traceId } = await params;

      if (!traceId) {
        return NextResponse.json(
          { error: "Trace ID is required" },
          { status: 400 },
        );
      }

      // Build and execute detail query
      const detailQuery = QueryBuilder.replaceParams(
        TelemetryQueries.traces.detail,
        { trace_id: traceId },
      );

      interface SpanRow {
        timestamp: string;
        span_id: string;
        parent_span_id: string;
        span_name: string;
        service_name: string;
        span_kind: string;
        duration_ms: string;
        status_code: string;
        status_message: string;
        attributes: Record<string, string>;
        resource_attributes: Record<string, string>;
        event_timestamps: string[];
        event_names: string[];
        event_attributes: Array<Record<string, string>>;
        link_trace_ids: string[];
        link_span_ids: string[];
        link_trace_states: string[];
        link_attributes: Array<Record<string, string>>;
      }

      const spansResult = await clickhouseClient.query<SpanRow>(detailQuery);

      if (spansResult.length === 0) {
        return NextResponse.json({ error: "Trace not found" }, { status: 404 });
      }

      // Transform spans
      const spans: Span[] = spansResult.map((row) => {
        // Build events array
        const events: SpanEvent[] = [];
        if (row.event_timestamps && row.event_names) {
          for (let i = 0; i < row.event_timestamps.length; i++) {
            events.push({
              timestamp: row.event_timestamps[i],
              name: row.event_names[i],
              attributes: row.event_attributes[i] || {},
            });
          }
        }

        // Build links array
        const links: SpanLink[] = [];
        if (row.link_trace_ids && row.link_span_ids) {
          for (let i = 0; i < row.link_trace_ids.length; i++) {
            links.push({
              trace_id: row.link_trace_ids[i],
              span_id: row.link_span_ids[i],
              trace_state: row.link_trace_states[i] || "",
              attributes: row.link_attributes[i] || {},
            });
          }
        }

        // Calculate start and end times
        const start_time = row.timestamp;
        const duration_ns = Number.parseFloat(row.duration_ms) * 1_000_000;
        const start_date = new Date(start_time);
        const end_date = new Date(
          start_date.getTime() + duration_ns / 1_000_000,
        );

        return {
          span_id: row.span_id,
          parent_span_id: row.parent_span_id,
          span_name: row.span_name,
          service_name: row.service_name,
          span_kind: row.span_kind,
          duration_ms: Number.parseFloat(row.duration_ms),
          start_time: start_time,
          end_time: end_date.toISOString(),
          status_code: row.status_code,
          status_message: row.status_message,
          attributes: row.attributes,
          resource_attributes: row.resource_attributes,
          events,
          links,
        };
      });

      // Calculate trace-level metrics
      const total_duration = spans.reduce(
        (sum, span) => Math.max(sum, span.duration_ms),
        0,
      );

      const has_error = spans.some(
        (span) => span.status_code === "STATUS_CODE_ERROR",
      );
      const has_success = spans.some(
        (span) => span.status_code === "STATUS_CODE_OK",
      );

      const status = has_error ? "ERROR" : has_success ? "SUCCESS" : "UNSET";

      // Extract user_id and group_id from first span's resource attributes
      const first_span = spans[0];
      const user_id = first_span?.resource_attributes?.user_id;
      const group_id = first_span?.resource_attributes?.group_id;

      const traceDetail: TraceDetail = {
        trace_id: traceId,
        duration_ms: total_duration,
        span_count: spans.length,
        status,
        user_id,
        group_id,
        spans,
      };

      return NextResponse.json(traceDetail);
    } catch (error) {
      console.error("Failed to fetch trace detail:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch trace detail",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);
