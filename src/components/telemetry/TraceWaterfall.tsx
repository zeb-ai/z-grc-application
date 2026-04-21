import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  formatDurationMs,
  getStatusColor,
  calculateSpanDepth,
} from "@/lib/telemetry";
import type { Span } from "@/types/telemetry";

interface TraceWaterfallProps {
  spans: Span[];
  onSpanClick: (span: Span) => void;
  selectedSpanId?: string;
}

export function TraceWaterfall({
  spans,
  onSpanClick,
  selectedSpanId,
}: TraceWaterfallProps) {
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(
    new Set(spans.map((s) => s.span_id)),
  );

  // Calculate trace duration (max end time - min start time)
  const minStartTime = Math.min(
    ...spans.map((s) => new Date(s.start_time).getTime()),
  );
  const maxEndTime = Math.max(
    ...spans.map((s) => new Date(s.end_time).getTime()),
  );
  const traceDuration = maxEndTime - minStartTime;

  // Build parent-child relationships
  const spansByParent = new Map<string, Span[]>();
  const rootSpans: Span[] = [];

  for (const span of spans) {
    if (!span.parent_span_id) {
      rootSpans.push(span);
    } else {
      if (!spansByParent.has(span.parent_span_id)) {
        spansByParent.set(span.parent_span_id, []);
      }
      spansByParent.get(span.parent_span_id)!.push(span);
    }
  }

  const toggleExpand = (spanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSpans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(spanId)) {
        newSet.delete(spanId);
      } else {
        newSet.add(spanId);
      }
      return newSet;
    });
  };

  const renderSpan = (span: Span, depth = 0) => {
    const children = spansByParent.get(span.span_id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedSpans.has(span.span_id);
    const isSelected = span.span_id === selectedSpanId;

    // Calculate position and width
    const startTime = new Date(span.start_time).getTime();
    const startOffset = ((startTime - minStartTime) / traceDuration) * 100;
    const width = (span.duration_ms / traceDuration) * 100;

    return (
      <div key={span.span_id}>
        <div
          className={`group flex items-center gap-2 py-2 px-3 hover:bg-muted/50 cursor-pointer border-l-2 ${
            isSelected ? "bg-muted border-l-primary" : "border-l-transparent"
          }`}
          onClick={() => onSpanClick(span)}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          <div className="w-4 h-4 flex-shrink-0">
            {hasChildren && (
              <button
                onClick={(e) => toggleExpand(span.span_id, e)}
                className="hover:bg-muted rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Span Info */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{span.span_name}</span>
                <span className="text-xs text-muted-foreground">
                  {span.service_name}
                </span>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="flex-1 relative h-6 bg-muted/30 rounded">
              <div
                className={`absolute h-full rounded ${getStatusColor(
                  span.status_code === "STATUS_CODE_ERROR"
                    ? "ERROR"
                    : span.status_code === "STATUS_CODE_OK"
                      ? "SUCCESS"
                      : "UNSET",
                )} opacity-80 group-hover:opacity-100 transition-opacity`}
                style={{
                  left: `${startOffset}%`,
                  width: `${Math.max(width, 0.5)}%`,
                }}
              />
            </div>

            {/* Duration */}
            <div className="text-sm font-mono text-muted-foreground w-20 text-right">
              {formatDurationMs(span.duration_ms)}
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderSpan(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 px-3 py-2 text-sm font-medium border-b">
        <div className="flex items-center justify-between">
          <span>Span Timeline</span>
          <span className="text-muted-foreground">
            Total: {formatDurationMs(traceDuration)}
          </span>
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {rootSpans.map((span) => renderSpan(span))}
      </div>
    </div>
  );
}