import { Activity, BarChart3, Database, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricsStats as Stats } from "@/types/telemetry";

interface MetricsStatsProps {
  stats: Stats;
  loading?: boolean;
}

export function MetricsStats({ stats, loading }: MetricsStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Data Points
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_metrics.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data/Minute</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.data_points_per_minute.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metric Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.by_type.length}</div>
            <p className="text-xs text-muted-foreground">Unique types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Metric</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {stats.top_metrics[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.top_metrics[0]?.count?.toLocaleString() || 0} points
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.by_type.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.by_type.map((item) => (
                <Badge
                  key={item.type}
                  variant="outline"
                  className="gap-2 px-3 py-1"
                >
                  <span className="font-medium capitalize">{item.type}</span>
                  <span className="text-muted-foreground">
                    {item.count.toLocaleString()}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
