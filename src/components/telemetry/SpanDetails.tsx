import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  extractHttpInfo,
  formatDurationMs,
  getHttpMethodColor,
  getStatusTextColor,
  shortenId,
} from "@/lib/telemetry";
import type { Span } from "@/types/telemetry";

interface SpanDetailsProps {
  span: Span;
}

export function SpanDetails({ span }: SpanDetailsProps) {
  const httpInfo = extractHttpInfo(span.attributes);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{span.span_name}</CardTitle>
          <Badge
            variant={
              span.status_code === "STATUS_CODE_ERROR" ? "destructive" : "secondary"
            }
          >
            {span.status_code.replace("STATUS_CODE_", "")}
          </Badge>
        </div>
        <CardDescription>{span.service_name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Span ID</div>
            <div className="font-mono text-sm">{shortenId(span.span_id)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Parent Span ID</div>
            <div className="font-mono text-sm">
              {span.parent_span_id ? shortenId(span.parent_span_id) : "None"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="font-semibold">
              {formatDurationMs(span.duration_ms)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Span Kind</div>
            <div>{span.span_kind.replace("SPAN_KIND_", "")}</div>
          </div>
        </div>

        {/* HTTP Info */}
        {(httpInfo.method || httpInfo.url) && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">HTTP Request</div>
              <div className="space-y-2">
                {httpInfo.method && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-20">
                      Method:
                    </span>
                    <Badge
                      variant="outline"
                      className={getHttpMethodColor(httpInfo.method)}
                    >
                      {httpInfo.method}
                    </Badge>
                  </div>
                )}
                {httpInfo.url && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-20">URL:</span>
                    <span className="text-sm font-mono break-all">
                      {httpInfo.url}
                    </span>
                  </div>
                )}
                {httpInfo.status_code && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-20">
                      Status:
                    </span>
                    <Badge
                      variant={
                        httpInfo.status_code.startsWith("2")
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {httpInfo.status_code}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Span Attributes */}
        {Object.keys(span.attributes).length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">Span Attributes</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {Object.entries(span.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30"
                  >
                    <span className="font-mono text-muted-foreground min-w-[120px]">
                      {key}:
                    </span>
                    <span className="font-mono break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Resource Attributes */}
        {Object.keys(span.resource_attributes).length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">Resource Attributes</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {Object.entries(span.resource_attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30"
                  >
                    <span className="font-mono text-muted-foreground min-w-[120px]">
                      {key}:
                    </span>
                    <span className="font-mono break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Events */}
        {span.events.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">
                Events ({span.events.length})
              </div>
              <div className="space-y-2">
                {span.events.map((event, i) => (
                  <div key={i} className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{event.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp}
                      </span>
                    </div>
                    {Object.keys(event.attributes).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {JSON.stringify(event.attributes)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}