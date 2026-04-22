import { formatDistanceToNow, parseISO } from "date-fns";
import type { Span } from "@/types/telemetry";

/**
 * Format duration in nanoseconds to human-readable format
 */
export function formatDuration(nanoseconds: number): string {
  const ms = nanoseconds / 1_000_000;

  if (ms < 1) {
    return `${(nanoseconds / 1_000).toFixed(2)}μs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${(ms / 60_000).toFixed(2)}m`;
}

/**
 * Format duration in milliseconds to human-readable format
 */
export function formatDurationMs(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${(ms / 60_000).toFixed(2)}m`;
}

/**
 * Parse OpenTelemetry status code to simple status
 */
export function parseStatus(statusCode: string): "SUCCESS" | "ERROR" | "UNSET" {
  if (statusCode === "STATUS_CODE_ERROR") {
    return "ERROR";
  }
  if (statusCode === "STATUS_CODE_OK") {
    return "SUCCESS";
  }
  return "UNSET";
}

/**
 * Get status badge color
 */
export function getStatusColor(status: "SUCCESS" | "ERROR" | "UNSET"): string {
  switch (status) {
    case "SUCCESS":
      return "bg-green-500";
    case "ERROR":
      return "bg-red-500";
    case "UNSET":
      return "bg-gray-500";
  }
}

/**
 * Get status text color
 */
export function getStatusTextColor(
  status: "SUCCESS" | "ERROR" | "UNSET",
): string {
  switch (status) {
    case "SUCCESS":
      return "text-green-600 dark:text-green-400";
    case "ERROR":
      return "text-red-600 dark:text-red-400";
    case "UNSET":
      return "text-gray-600 dark:text-gray-400";
  }
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  } catch {
    return timestamp;
  }
}

/**
 * Build span tree from flat list of spans
 */
export function buildSpanTree(spans: Span[]): Span[] {
  // Find root spans (no parent)
  const rootSpans = spans.filter((span) => !span.parent_span_id);

  // Recursively build tree
  function attachChildren(parent: Span): Span {
    const children = spans.filter(
      (span) => span.parent_span_id === parent.span_id,
    );
    return {
      ...parent,
      children: children.map(attachChildren),
    } as Span & { children?: Span[] };
  }

  return rootSpans.map(attachChildren);
}

/**
 * Calculate span depth in trace tree
 */
export function calculateSpanDepth(
  span: Span,
  allSpans: Span[],
  depth = 0,
): number {
  if (!span.parent_span_id) {
    return depth;
  }

  const parent = allSpans.find((s) => s.span_id === span.parent_span_id);
  if (!parent) {
    return depth;
  }

  return calculateSpanDepth(parent, allSpans, depth + 1);
}

/**
 * Get HTTP method color
 */
export function getHttpMethodColor(method: string): string {
  switch (method?.toUpperCase()) {
    case "GET":
      return "text-blue-600 dark:text-blue-400";
    case "POST":
      return "text-green-600 dark:text-green-400";
    case "PUT":
      return "text-yellow-600 dark:text-yellow-400";
    case "DELETE":
      return "text-red-600 dark:text-red-400";
    case "PATCH":
      return "text-purple-600 dark:text-purple-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

/**
 * Extract HTTP info from span attributes
 */
export function extractHttpInfo(attributes: Record<string, string>): {
  method?: string;
  url?: string;
  status_code?: string;
} {
  return {
    method: attributes["http.method"],
    url: attributes["http.url"] || attributes["url.full"],
    status_code: attributes["http.status_code"],
  };
}

/**
 * Shorten trace/span ID for display
 */
export function shortenId(id: string, length = 8): string {
  if (!id) return "";
  return id.length > length ? `${id.substring(0, length)}...` : id;
}

/**
 * Log Severity Utilities
 */

import type { LogSeverity } from "@/types/telemetry";

/**
 * Get log severity color for badge
 */
export function getLogSeverityColor(severity: LogSeverity): string {
  switch (severity) {
    case "FATAL":
      return "bg-red-600";
    case "ERROR":
      return "bg-red-500";
    case "WARN":
      return "bg-yellow-500";
    case "INFO":
      return "bg-blue-500";
    case "DEBUG":
      return "bg-gray-500";
    case "TRACE":
      return "bg-gray-400";
    default:
      return "bg-gray-500";
  }
}

/**
 * Get log severity text color
 */
export function getLogSeverityTextColor(severity: LogSeverity): string {
  switch (severity) {
    case "FATAL":
    case "ERROR":
      return "text-red-600 dark:text-red-400";
    case "WARN":
      return "text-yellow-600 dark:text-yellow-400";
    case "INFO":
      return "text-blue-600 dark:text-blue-400";
    case "DEBUG":
    case "TRACE":
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

/**
 * Get log severity variant for Badge component
 */
export function getLogSeverityVariant(
  severity: LogSeverity,
): "default" | "destructive" | "secondary" | "outline" {
  switch (severity) {
    case "FATAL":
    case "ERROR":
      return "destructive";
    case "WARN":
      return "default";
    case "INFO":
      return "secondary";
    case "DEBUG":
    case "TRACE":
      return "outline";
    default:
      return "secondary";
  }
}
