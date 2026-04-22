import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatRelativeTime,
  getLogSeverityVariant,
  shortenId,
} from "@/lib/telemetry";
import type { Log } from "@/types/telemetry";

interface LogsTableProps {
  logs: Log[];
  loading?: boolean;
}

export function LogsTable({ logs, loading }: LogsTableProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpand = (index: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
        <p className="text-lg font-semibold mb-2">No logs found</p>
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
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[100px]">Severity</TableHead>
            <TableHead className="w-[150px]">Service</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[100px]">Trace</TableHead>
            <TableHead className="w-[150px]">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => {
            const logKey = `${log.timestamp}-${index}`;
            const isExpanded = expandedLogs.has(logKey);

            return (
              <>
                <TableRow
                  key={logKey}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleExpand(logKey)}
                >
                  <TableCell>
                    <button className="hover:bg-muted rounded p-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getLogSeverityVariant(log.severity)}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.service_name}
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm truncate max-w-md">
                      {log.body}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.trace_id ? (
                      <Link
                        href={`/monitoring/telemetry/${log.trace_id}`}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="font-mono">
                          {shortenId(log.trace_id, 8)}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(log.timestamp)}
                  </TableCell>
                </TableRow>

                {/* Expanded Details */}
                {isExpanded && (
                  <TableRow key={`${logKey}-details`}>
                    <TableCell colSpan={6} className="bg-muted/30">
                      <div className="p-4 space-y-4">
                        {/* Full Message */}
                        <div>
                          <div className="text-sm font-medium mb-1">
                            Full Message
                          </div>
                          <div className="p-3 bg-background border rounded font-mono text-sm whitespace-pre-wrap break-all">
                            {log.body}
                          </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">
                              Timestamp
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {new Date(log.timestamp).toISOString()}
                            </div>
                          </div>
                          {log.span_id && (
                            <div>
                              <div className="text-sm font-medium mb-1">
                                Span ID
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {log.span_id}
                              </div>
                            </div>
                          )}
                          {log.user_id && (
                            <div>
                              <div className="text-sm font-medium mb-1">
                                User ID
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {log.user_id}
                              </div>
                            </div>
                          )}
                          {log.group_id && (
                            <div>
                              <div className="text-sm font-medium mb-1">
                                Group ID
                              </div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {log.group_id}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Log Attributes */}
                        {Object.keys(log.log_attributes).length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">
                              Log Attributes
                            </div>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto">
                              {Object.entries(log.log_attributes).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-start gap-2 text-xs p-2 rounded bg-background"
                                  >
                                    <span className="font-mono text-muted-foreground min-w-[120px]">
                                      {key}:
                                    </span>
                                    <span className="font-mono break-all">
                                      {value}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Resource Attributes */}
                        {Object.keys(log.resource_attributes).length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">
                              Resource Attributes
                            </div>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto">
                              {Object.entries(log.resource_attributes).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-start gap-2 text-xs p-2 rounded bg-background"
                                  >
                                    <span className="font-mono text-muted-foreground min-w-[120px]">
                                      {key}:
                                    </span>
                                    <span className="font-mono break-all">
                                      {value}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
