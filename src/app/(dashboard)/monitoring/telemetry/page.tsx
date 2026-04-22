"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TelemetryFilters } from "@/components/telemetry/TelemetryFilters";
import { TelemetryStats } from "@/components/telemetry/TelemetryStats";
import { TracesList } from "@/components/telemetry/TracesList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  TelemetryFilters as Filters,
  TelemetryStats as Stats,
  Trace,
} from "@/types/telemetry";

export default function TelemetryPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracesLoading, setTracesLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    limit: 50,
    offset: 0,
  });
  const [total, setTotal] = useState(0);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch traces when filters change
  useEffect(() => {
    fetchTraces();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/telemetry/stats");
      const data = await res.json();

      if (res.ok) {
        setStats(data);
        // Extract unique services
        const serviceNames = data.top_services.map(
          (s: { name: string }) => s.name,
        );
        setServices(serviceNames);
      } else {
        toast.error(data.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to fetch telemetry stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchTraces = async () => {
    try {
      setTracesLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.group_id) params.append("group_id", filters.group_id);
      if (filters.service) params.append("service", filters.service);
      if (filters.status && filters.status !== "ALL")
        params.append("status", filters.status);
      if (filters.min_duration)
        params.append("min_duration", filters.min_duration.toString());
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      params.append("limit", (filters.limit || 50).toString());
      params.append("offset", (filters.offset || 0).toString());

      const res = await fetch(`/api/telemetry/traces?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setTraces(data.traces);
        setTotal(data.total);
      } else {
        toast.error(data.error || "Failed to fetch traces");
      }
    } catch (error) {
      console.error("Failed to fetch traces:", error);
      toast.error("Failed to fetch traces");
    } finally {
      setTracesLoading(false);
    }
  };

  const handleLoadMore = () => {
    setFilters({
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 50),
    });
  };

  const hasMore = (filters.offset || 0) + traces.length < total;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Telemetry</h1>
        <p className="text-muted-foreground">
          Distributed traces and request flows across services
        </p>
      </div>

      {/* Stats */}
      {stats && <TelemetryStats stats={stats} loading={loading} />}

      {/* Traces */}
      <Card>
        <CardHeader>
          <CardTitle>Traces</CardTitle>
          <CardDescription>
            {total > 0
              ? `Showing ${traces.length} of ${total.toLocaleString()} traces`
              : "No traces found"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <TelemetryFilters
            filters={filters}
            onFiltersChange={setFilters}
            services={services}
          />

          {/* Traces List */}
          <TracesList traces={traces} loading={tracesLoading} />

          {/* Load More */}
          {hasMore && !tracesLoading && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleLoadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
