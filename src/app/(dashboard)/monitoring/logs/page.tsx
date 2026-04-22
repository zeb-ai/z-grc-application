"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LogsFilters } from "@/components/logs/LogsFilters";
import { LogsStats } from "@/components/logs/LogsStats";
import { LogsTable } from "@/components/logs/LogsTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Log, LogFilters, LogsStats as Stats } from "@/types/telemetry";

export default function LogsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({
    severity: "ALL",
    limit: 100,
    offset: 0,
  });
  const [total, setTotal] = useState(0);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/logs/stats");
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
      toast.error("Failed to fetch logs stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.group_id) params.append("group_id", filters.group_id);
      if (filters.service) params.append("service", filters.service);
      if (filters.severity && filters.severity !== "ALL")
        params.append("severity", filters.severity);
      if (filters.search) params.append("search", filters.search);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      params.append("limit", (filters.limit || 100).toString());
      params.append("offset", (filters.offset || 0).toString());

      const res = await fetch(`/api/logs?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      } else {
        toast.error(data.error || "Failed to fetch logs");
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Failed to fetch logs");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setFilters({
      ...filters,
      offset: (filters.offset || 0) + (filters.limit || 100),
    });
  };

  const hasMore = (filters.offset || 0) + logs.length < total;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">
          View and analyze system logs and events
        </p>
      </div>

      {/* Stats */}
      {stats && <LogsStats stats={stats} loading={loading} />}

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            {total > 0
              ? `Showing ${logs.length} of ${total.toLocaleString()} logs`
              : "No logs found"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <LogsFilters
            filters={filters}
            onFiltersChange={setFilters}
            services={services}
          />

          {/* Logs Table */}
          <LogsTable logs={logs} loading={logsLoading} />

          {/* Load More */}
          {hasMore && !logsLoading && (
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
