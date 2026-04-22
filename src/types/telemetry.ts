/**
 * Telemetry Types for OpenTelemetry data from ClickHouse
 */

export interface Trace {
  trace_id: string;
  timestamp: string;
  root_span_name: string;
  service_name: string;
  duration_ms: number;
  span_count: number;
  user_id?: string;
  group_id?: string;
  status: "SUCCESS" | "ERROR" | "UNSET";
}

export interface Span {
  span_id: string;
  parent_span_id: string;
  span_name: string;
  service_name: string;
  span_kind: string;
  duration_ms: number;
  start_time: string;
  end_time: string;
  status_code: string;
  status_message?: string;
  attributes: Record<string, string>;
  resource_attributes: Record<string, string>;
  events: SpanEvent[];
  links: SpanLink[];
}

export interface SpanEvent {
  timestamp: string;
  name: string;
  attributes: Record<string, string>;
}

export interface SpanLink {
  trace_id: string;
  span_id: string;
  trace_state: string;
  attributes: Record<string, string>;
}

export interface TraceDetail {
  trace_id: string;
  duration_ms: number;
  span_count: number;
  status: "SUCCESS" | "ERROR" | "UNSET";
  user_id?: string;
  group_id?: string;
  spans: Span[];
}

export interface TelemetryStats {
  total_traces: number;
  total_spans: number;
  avg_duration_ms: number;
  error_rate: number;
  requests_per_minute: number;
  top_services: ServiceStat[];
  top_endpoints: EndpointStat[];
}

export interface ServiceStat {
  name: string;
  count: number;
}

export interface EndpointStat {
  name: string;
  count: number;
  avg_duration_ms: number;
}

export interface TelemetryFilters {
  user_id?: string;
  group_id?: string;
  service?: string;
  status?: "SUCCESS" | "ERROR" | "ALL";
  min_duration?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface TracesResponse {
  traces: Trace[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Logs Types
 */

export type LogSeverity =
  | "TRACE"
  | "DEBUG"
  | "INFO"
  | "WARN"
  | "ERROR"
  | "FATAL";

export interface Log {
  timestamp: string;
  trace_id?: string;
  span_id?: string;
  severity: LogSeverity;
  severity_number: number;
  service_name: string;
  body: string;
  resource_attributes: Record<string, string>;
  log_attributes: Record<string, string>;
  user_id?: string;
  group_id?: string;
}

export interface LogsStats {
  total_logs: number;
  logs_per_minute: number;
  by_severity: {
    severity: LogSeverity;
    count: number;
  }[];
  top_services: ServiceStat[];
  error_rate: number;
}

export interface LogFilters {
  user_id?: string;
  group_id?: string;
  service?: string;
  severity?: LogSeverity | "ALL";
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  logs: Log[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Metrics Types
 */

export type MetricType = "gauge" | "sum" | "histogram" | "summary";

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  attributes?: Record<string, string>;
}

export interface HistogramDataPoint {
  timestamp: string;
  count: number;
  sum: number;
  bucket_counts: number[];
  explicit_bounds: number[];
  min?: number;
  max?: number;
}

export interface MetricInfo {
  name: string;
  type: MetricType;
  description: string;
  unit: string;
  count: number;
}

export interface MetricsStats {
  total_metrics: number;
  by_type: {
    type: MetricType;
    count: number;
  }[];
  top_metrics: {
    name: string;
    type: MetricType;
    count: number;
  }[];
  data_points_per_minute: number;
}

export interface MetricFilters {
  metric_name?: string;
  type?: MetricType | "ALL";
  service?: string;
  user_id?: string;
  group_id?: string;
  from?: string;
  to?: string;
}

export interface MetricsListResponse {
  metrics: MetricInfo[];
  total: number;
}

export interface MetricDataResponse {
  metric_name: string;
  type: MetricType;
  data_points: MetricDataPoint[] | HistogramDataPoint[];
  total: number;
}
