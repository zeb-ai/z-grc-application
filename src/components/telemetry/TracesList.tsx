import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDurationMs,
  formatRelativeTime,
  getStatusColor,
  getStatusTextColor,
  shortenId,
} from "@/lib/telemetry";
import type { Trace } from "@/types/telemetry";

interface TracesListProps {
  traces: Trace[];
  loading?: boolean;
}

export function TracesList({ traces, loading }: TracesListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (traces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
        <p className="text-lg font-semibold mb-2">No traces found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Trace ID</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead className="w-[120px]">Service</TableHead>
            <TableHead className="w-[100px]">Spans</TableHead>
            <TableHead className="w-[100px]">Duration</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px]">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traces.map((trace) => (
            <TableRow
              key={trace.trace_id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() =>
                router.push(`/monitoring/telemetry/${trace.trace_id}`)
              }
            >
              <TableCell className="font-mono text-xs">
                {shortenId(trace.trace_id, 12)}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="truncate max-w-md">
                    {trace.root_span_name}
                  </span>
                  {trace.user_id && (
                    <span className="text-xs text-muted-foreground truncate">
                      User: {shortenId(trace.user_id, 8)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {trace.service_name}
              </TableCell>
              <TableCell className="text-sm">{trace.span_count}</TableCell>
              <TableCell className="font-mono text-sm">
                {formatDurationMs(trace.duration_ms)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={trace.status === "ERROR" ? "destructive" : "secondary"}
                  className="gap-1"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${getStatusColor(trace.status)}`}
                  />
                  <span className={getStatusTextColor(trace.status)}>
                    {trace.status}
                  </span>
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(trace.timestamp)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}