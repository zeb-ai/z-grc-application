"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SystemHealth } from "@/types/dashboard";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface SystemHealthCardProps {
  health: SystemHealth | null;
  loading?: boolean;
}

export function SystemHealthCard({ health, loading }: SystemHealthCardProps) {
  if (loading || !health) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    health.apiResponseTime,
    health.errorRate,
    health.databaseConnection,
    health.clickhouseConnection,
  ];

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>
          Current system status and metrics
          <span className="block text-xs mt-1 text-muted-foreground/70">
            Last updated: {new Date(health.lastUpdated).toLocaleTimeString()}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {metrics.map((metric) => {
          const percentage =
            metric.unit === "%"
              ? metric.value
              : metric.name.includes("Connection")
                ? metric.value
                : metric.threshold
                  ? Math.min(
                      100,
                      ((metric.threshold.critical - metric.value) /
                        metric.threshold.critical) *
                        100,
                    )
                  : 50;

          const statusConfig = {
            healthy: {
              color: "bg-green-500",
              icon: CheckCircle2,
              iconColor: "text-green-500",
              textColor: "text-green-600 dark:text-green-400",
            },
            warning: {
              color: "bg-yellow-500",
              icon: AlertCircle,
              iconColor: "text-yellow-500",
              textColor: "text-yellow-600 dark:text-yellow-400",
            },
            critical: {
              color: "bg-red-500",
              icon: XCircle,
              iconColor: "text-red-500",
              textColor: "text-red-600 dark:text-red-400",
            },
          };

          const config = statusConfig[metric.status];
          const StatusIcon = config.icon;

          return (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <span className={cn("text-sm font-semibold", config.textColor)}>
                  {metric.value.toFixed(metric.unit === "ms" ? 0 : 1)}
                  {metric.unit}
                </span>
              </div>
              <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    config.color,
                  )}
                  style={{ width: `${Math.max(5, percentage)}%` }}
                />
              </div>
              {metric.threshold && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Warning: {metric.threshold.warning}
                    {metric.unit}
                  </span>
                  <span>
                    Critical: {metric.threshold.critical}
                    {metric.unit}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}