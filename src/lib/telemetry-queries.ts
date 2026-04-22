/**
 * Telemetry Query Registry
 * Centralized repository for all ClickHouse telemetry queries
 */

export const TelemetryQueries = {
  /**
   * Stats Queries
   */
  stats: {
    totalTraces: `
      SELECT count(DISTINCT TraceId) as count
      FROM otel_traces
    `,

    totalSpans: `
      SELECT count() as count
      FROM otel_traces
    `,

    avgDuration: `
      SELECT avg(Duration) / 1000000 as avg_duration
      FROM otel_traces
      WHERE ParentSpanId = ''
    `,

    errorRate: `
      SELECT
        countIf(StatusCode = 'STATUS_CODE_ERROR') / count() * 100 as error_rate
      FROM otel_traces
      WHERE ParentSpanId = ''
    `,

    requestsPerMinute: `
      SELECT
        count(DISTINCT TraceId) / 60 as rpm
      FROM otel_traces
      WHERE Timestamp >= now() - INTERVAL 1 HOUR
        AND ParentSpanId = ''
    `,

    topServices: `
      SELECT
        ServiceName as name,
        count(DISTINCT TraceId) as count
      FROM otel_traces
      GROUP BY ServiceName
      ORDER BY count DESC
      LIMIT 5
    `,

    topEndpoints: `
      SELECT
        SpanName as name,
        count() as count,
        avg(Duration) / 1000000 as avg_duration
      FROM otel_traces
      WHERE ParentSpanId = ''
      GROUP BY SpanName
      ORDER BY count DESC
      LIMIT 5
    `,
  },

  /**
   * Traces Queries
   */
  traces: {
    list: `
      SELECT
        TraceId as trace_id,
        min(Timestamp) as timestamp,
        any(SpanName) as root_span_name,
        any(ServiceName) as service_name,
        sum(Duration) / 1000000 as duration_ms,
        count() as span_count,
        any(ResourceAttributes['user_id']) as user_id,
        any(ResourceAttributes['group_id']) as group_id,
        if(countIf(StatusCode = 'STATUS_CODE_ERROR') > 0, 'ERROR',
           if(countIf(StatusCode = 'STATUS_CODE_OK') > 0, 'SUCCESS', 'UNSET')) as status
      FROM otel_traces
      WHERE 1=1
        {filters}
      GROUP BY TraceId
      ORDER BY timestamp DESC
      LIMIT {limit} OFFSET {offset}
    `,

    count: `
      SELECT count(DISTINCT TraceId) as total
      FROM otel_traces
      WHERE 1=1
        {filters}
    `,

    detail: `
      SELECT
        Timestamp as timestamp,
        SpanId as span_id,
        ParentSpanId as parent_span_id,
        SpanName as span_name,
        ServiceName as service_name,
        SpanKind as span_kind,
        Duration / 1000000 as duration_ms,
        StatusCode as status_code,
        StatusMessage as status_message,
        SpanAttributes as attributes,
        ResourceAttributes as resource_attributes,
        Events.Timestamp as event_timestamps,
        Events.Name as event_names,
        Events.Attributes as event_attributes,
        Links.TraceId as link_trace_ids,
        Links.SpanId as link_span_ids,
        Links.TraceState as link_trace_states,
        Links.Attributes as link_attributes
      FROM otel_traces
      WHERE TraceId = {trace_id}
      ORDER BY Timestamp ASC
    `,
  },

  /**
   * Logs Queries
   */
  logs: {
    list: `
      SELECT
        Timestamp as timestamp,
        TraceId as trace_id,
        SpanId as span_id,
        SeverityText as severity,
        SeverityNumber as severity_number,
        ServiceName as service_name,
        Body as body,
        ResourceAttributes as resource_attributes,
        LogAttributes as log_attributes
      FROM otel_logs
      WHERE 1=1
        {filters}
      ORDER BY Timestamp DESC
      LIMIT {limit} OFFSET {offset}
    `,

    count: `
      SELECT count() as total
      FROM otel_logs
      WHERE 1=1
        {filters}
    `,

    stats: {
      totalLogs: `
        SELECT count() as count
        FROM otel_logs
      `,

      logsPerMinute: `
        SELECT count() / 60 as lpm
        FROM otel_logs
        WHERE Timestamp >= now() - INTERVAL 1 HOUR
      `,

      bySeverity: `
        SELECT
          SeverityText as severity,
          count() as count
        FROM otel_logs
        GROUP BY SeverityText
        ORDER BY count DESC
      `,

      topServices: `
        SELECT
          ServiceName as name,
          count() as count
        FROM otel_logs
        GROUP BY ServiceName
        ORDER BY count DESC
        LIMIT 5
      `,

      errorRate: `
        SELECT
          countIf(SeverityText IN ('ERROR', 'FATAL')) / count() * 100 as error_rate
        FROM otel_logs
      `,
    },
  },

  /**
   * Metrics Queries
   */
  metrics: {
    list: {
      gauges: `
        SELECT
          MetricName as name,
          'gauge' as type,
          any(MetricDescription) as description,
          any(MetricUnit) as unit,
          count() as count
        FROM otel_metrics_gauge
        GROUP BY MetricName
      `,

      sums: `
        SELECT
          MetricName as name,
          'sum' as type,
          any(MetricDescription) as description,
          any(MetricUnit) as unit,
          count() as count
        FROM otel_metrics_sum
        GROUP BY MetricName
      `,

      histograms: `
        SELECT
          MetricName as name,
          'histogram' as type,
          any(MetricDescription) as description,
          any(MetricUnit) as unit,
          count() as count
        FROM otel_metrics_histogram
        GROUP BY MetricName
      `,

      summaries: `
        SELECT
          MetricName as name,
          'summary' as type,
          any(MetricDescription) as description,
          any(MetricUnit) as unit,
          count() as count
        FROM otel_metrics_summary
        GROUP BY MetricName
      `,
    },

    data: {
      gauges: `
        SELECT
          TimeUnix as timestamp,
          Value as value,
          Attributes as attributes,
          ResourceAttributes['user_id'] as user_id,
          ResourceAttributes['group_id'] as group_id
        FROM otel_metrics_gauge
        WHERE MetricName = {metric_name}
          {filters}
        ORDER BY TimeUnix ASC
        LIMIT {limit}
      `,

      sums: `
        SELECT
          TimeUnix as timestamp,
          Value as value,
          Attributes as attributes,
          ResourceAttributes['user_id'] as user_id,
          ResourceAttributes['group_id'] as group_id
        FROM otel_metrics_sum
        WHERE MetricName = {metric_name}
          {filters}
        ORDER BY TimeUnix ASC
        LIMIT {limit}
      `,

      histograms: `
        SELECT
          TimeUnix as timestamp,
          Count as count,
          Sum as sum,
          BucketCounts as bucket_counts,
          ExplicitBounds as explicit_bounds,
          Min as min,
          Attributes as attributes,
          ResourceAttributes['user_id'] as user_id,
          ResourceAttributes['group_id'] as group_id
        FROM otel_metrics_histogram
        WHERE MetricName = {metric_name}
          {filters}
        ORDER BY TimeUnix ASC
        LIMIT {limit}
      `,
    },

    stats: {
      totalGauges: `
        SELECT count() as count
        FROM otel_metrics_gauge
      `,

      totalSums: `
        SELECT count() as count
        FROM otel_metrics_sum
      `,

      totalHistograms: `
        SELECT count() as count
        FROM otel_metrics_histogram
      `,

      totalSummaries: `
        SELECT count() as count
        FROM otel_metrics_summary
      `,

      dataPointsPerMinute: `
        SELECT
          (
            (SELECT count() FROM otel_metrics_gauge WHERE TimeUnix >= now() - INTERVAL 1 HOUR) +
            (SELECT count() FROM otel_metrics_sum WHERE TimeUnix >= now() - INTERVAL 1 HOUR) +
            (SELECT count() FROM otel_metrics_histogram WHERE TimeUnix >= now() - INTERVAL 1 HOUR) +
            (SELECT count() FROM otel_metrics_summary WHERE TimeUnix >= now() - INTERVAL 1 HOUR)
          ) / 60 as dpm
      `,
    },
  },
} as const;

/**
 * Query Builder Helper
 */
export class QueryBuilder {
  /**
   * Build filter conditions for traces
   */
  static buildTraceFilters(filters: {
    user_id?: string;
    group_id?: string;
    service?: string;
    status?: string;
    min_duration?: number;
    from?: string;
    to?: string;
  }): string {
    const conditions: string[] = [];

    if (filters.user_id) {
      conditions.push(`ResourceAttributes['user_id'] = '${filters.user_id}'`);
    }

    if (filters.group_id) {
      conditions.push(`ResourceAttributes['group_id'] = '${filters.group_id}'`);
    }

    if (filters.service) {
      conditions.push(`ServiceName = '${filters.service}'`);
    }

    if (filters.status && filters.status !== "ALL") {
      if (filters.status === "ERROR") {
        conditions.push(`StatusCode = 'STATUS_CODE_ERROR'`);
      } else if (filters.status === "SUCCESS") {
        conditions.push(`StatusCode = 'STATUS_CODE_OK'`);
      }
    }

    if (filters.min_duration) {
      conditions.push(`Duration >= ${filters.min_duration * 1_000_000}`);
    }

    if (filters.from) {
      conditions.push(`Timestamp >= '${filters.from}'`);
    }

    if (filters.to) {
      conditions.push(`Timestamp <= '${filters.to}'`);
    }

    return conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
  }

  /**
   * Build filter conditions for metrics
   */
  static buildMetricFilters(filters: {
    user_id?: string;
    group_id?: string;
    service?: string;
    from?: string;
    to?: string;
  }): string {
    const conditions: string[] = [];

    if (filters.user_id) {
      conditions.push(`ResourceAttributes['user_id'] = '${filters.user_id}'`);
    }

    if (filters.group_id) {
      conditions.push(`ResourceAttributes['group_id'] = '${filters.group_id}'`);
    }

    if (filters.service) {
      conditions.push(`ServiceName = '${filters.service}'`);
    }

    if (filters.from) {
      // Convert ISO string to ClickHouse DateTime64 format
      conditions.push(`TimeUnix >= parseDateTimeBestEffort('${filters.from}')`);
    }

    if (filters.to) {
      // Convert ISO string to ClickHouse DateTime64 format
      conditions.push(`TimeUnix <= parseDateTimeBestEffort('${filters.to}')`);
    }

    return conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
  }

  /**
   * Build filter conditions for logs
   */
  static buildLogFilters(filters: {
    user_id?: string;
    group_id?: string;
    service?: string;
    severity?: string;
    search?: string;
    from?: string;
    to?: string;
  }): string {
    const conditions: string[] = [];

    if (filters.user_id) {
      conditions.push(`ResourceAttributes['user_id'] = '${filters.user_id}'`);
    }

    if (filters.group_id) {
      conditions.push(`ResourceAttributes['group_id'] = '${filters.group_id}'`);
    }

    if (filters.service) {
      conditions.push(`ServiceName = '${filters.service}'`);
    }

    if (filters.severity) {
      conditions.push(`SeverityText = '${filters.severity}'`);
    }

    if (filters.search) {
      conditions.push(`Body ILIKE '%${filters.search}%'`);
    }

    if (filters.from) {
      conditions.push(`Timestamp >= '${filters.from}'`);
    }

    if (filters.to) {
      conditions.push(`Timestamp <= '${filters.to}'`);
    }

    return conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
  }

  /**
   * Replace query placeholders
   */
  static replaceParams(
    query: string,
    params: Record<string, string | number>,
  ): string {
    let result = query;

    for (const [key, value] of Object.entries(params)) {
      const placeholder = `{${key}}`;
      result = result.replace(
        new RegExp(placeholder, "g"),
        typeof value === "string" ? `'${value}'` : String(value),
      );
    }

    return result;
  }
}
