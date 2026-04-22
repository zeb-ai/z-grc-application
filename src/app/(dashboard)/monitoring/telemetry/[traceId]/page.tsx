"use client";

import { Activity, ArrowLeft, Clock, Layers } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SpanDetails } from "@/components/telemetry/SpanDetails";
import { TraceWaterfall } from "@/components/telemetry/TraceWaterfall";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDurationMs,
  getStatusColor,
  getStatusTextColor,
  shortenId,
} from "@/lib/telemetry";
import type { Span, TraceDetail } from "@/types/telemetry";

export default function TraceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traceId = params.traceId as string;

  const [trace, setTrace] = useState<TraceDetail | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (traceId) {
      fetchTraceDetail();
    }
  }, [traceId]);

  const fetchTraceDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/telemetry/traces/${traceId}`);
      const data = await res.json();

      if (res.ok) {
        setTrace(data);
        // Auto-select first span
        if (data.spans.length > 0) {
          setSelectedSpan(data.spans[0]);
        }
      } else {
        toast.error(data.error || "Failed to fetch trace");
        if (res.status === 404) {
          setTimeout(() => router.push("/monitoring/telemetry"), 2000);
        }
      }
    } catch (error) {
      console.error("Failed to fetch trace:", error);
      toast.error("Failed to fetch trace detail");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4 flex flex-col items-center justify-center min-h-[400px]">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Trace Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The trace you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/monitoring/telemetry")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Telemetry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/monitoring/telemetry")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Trace Details</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {shortenId(trace.trace_id, 16)}
          </p>
        </div>
        <Badge
          variant={trace.status === "ERROR" ? "destructive" : "secondary"}
          className="gap-1 px-3 py-1"
        >
          <div
            className={`h-2 w-2 rounded-full ${getStatusColor(trace.status)}`}
          />
          <span className={getStatusTextColor(trace.status)}>
            {trace.status}
          </span>
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDurationMs(trace.duration_ms)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spans</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trace.span_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">
              {trace.user_id ? shortenId(trace.user_id, 12) : "N/A"}
            </div>
            {trace.group_id && (
              <p className="text-xs text-muted-foreground">
                Group: {shortenId(trace.group_id, 8)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Waterfall */}
        <div className="md:col-span-1">
          <TraceWaterfall
            spans={trace.spans}
            onSpanClick={setSelectedSpan}
            selectedSpanId={selectedSpan?.span_id}
          />
        </div>

        {/* Span Details */}
        <div className="md:col-span-1">
          {selectedSpan ? (
            <SpanDetails span={selectedSpan} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">
                  Select a span to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
