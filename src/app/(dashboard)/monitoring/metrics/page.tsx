"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MetricChart } from "@/components/metrics/MetricChart";
import { MetricSelector } from "@/components/metrics/MetricSelector";
import { MetricsFilters } from "@/components/metrics/MetricsFilters";
import { MetricsStats } from "@/components/metrics/MetricsStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  HistogramDataPoint,
  MetricDataPoint,
  MetricFilters,
  MetricInfo,
  MetricType,
  MetricsStats as Stats,
} from "@/types/telemetry";

export default function MetricsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [metrics, setMetrics] = useState<MetricInfo[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<MetricType | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [filters, setFilters] = useState<MetricFilters>({});
  const [metricData, setMetricData] = useState<
    MetricDataPoint[] | HistogramDataPoint[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch stats and metrics list on mount
  useEffect(() => {
    fetchStats();
    fetchMetricsList();
  }, []);

  // Fetch metric data when selection or filters change
  useEffect(() => {
    if (selectedMetric && selectedType) {
      fetchMetricData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedMetric,
    selectedType,
    timeRange,
    filters.user_id,
    filters.group_id,
    filters.service,
  ]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/metrics/stats");
      const data = await res.json();

      if (res.ok) {
        setStats(data);
        // Services will be populated when we fetch metric data
      } else {
        toast.error(data.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to fetch metrics stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricsList = async () => {
    try {
      const res = await fetch("/api/metrics/list");
      const data = await res.json();

      if (res.ok) {
        setMetrics(data.metrics);
        // Auto-select first metric
        if (data.metrics.length > 0) {
          setSelectedMetric(data.metrics[0].name);
          setSelectedType(data.metrics[0].type);
        }
      } else {
        toast.error(data.error || "Failed to fetch metrics list");
      }
    } catch (error) {
      console.error("Failed to fetch metrics list:", error);
      toast.error("Failed to fetch metrics list");
    }
  };

  const fetchMetricData = async () => {
    if (!selectedMetric || !selectedType) return;

    try {
      setDataLoading(true);

      // Calculate time range
      let from: string | undefined;
      let to: string | undefined;

      if (timeRange.startsWith("custom:")) {
        const parts = timeRange.split(":");
        from = parts[1];
        to = parts[2];
      } else {
        const now = new Date();
        to = now.toISOString();

        switch (timeRange) {
          case "1h":
            from = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
            break;
          case "6h":
            from = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
            break;
          case "24h":
            from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            break;
          case "7d":
            from = new Date(
              now.getTime() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString();
            break;
          case "30d":
            from = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString();
            break;
        }
      }

      const params = new URLSearchParams({
        metric_name: selectedMetric,
        type: selectedType,
      });

      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.group_id) params.append("group_id", filters.group_id);
      if (filters.service) params.append("service", filters.service);

      const res = await fetch(`/api/metrics/data?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setMetricData(data.data_points);
        // Note: Services can be extracted from resource attributes if needed
      } else {
        toast.error(data.error || "Failed to fetch metric data");
      }
    } catch (error) {
      console.error("Failed to fetch metric data:", error);
      toast.error("Failed to fetch metric data");
    } finally {
      setDataLoading(false);
    }
  };

  const handleMetricChange = (metricName: string, type: MetricType) => {
    setSelectedMetric(metricName);
    setSelectedType(type);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
        <p className="text-muted-foreground">
          Monitor system performance and metrics
        </p>
      </div>

      {/* Stats */}
      {stats && <MetricsStats stats={stats} loading={loading} />}

      {/* Metric Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Metric</CardTitle>
          <CardDescription>
            Choose a metric and time range to visualize
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricSelector
            metrics={metrics}
            selectedMetric={selectedMetric}
            onMetricChange={handleMetricChange}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* Filters */}
          {selectedMetric && (
            <div className="pt-4 border-t">
              <div className="mb-3">
                <h3 className="text-sm font-medium">Filters</h3>
                <p className="text-xs text-muted-foreground">
                  Filter metric data by user, group, or service
                </p>
              </div>
              <MetricsFilters
                filters={filters}
                onFiltersChange={setFilters}
                services={[]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      {selectedMetric && selectedType && (
        <MetricChart
          metricName={selectedMetric}
          type={selectedType}
          dataPoints={metricData}
          loading={dataLoading}
        />
      )}

      {/* No Metrics Message */}
      {!loading && metrics.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                No Metrics Available
              </h3>
              <p className="text-sm text-muted-foreground">
                Start sending metrics data to see visualizations here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
