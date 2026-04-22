"use client";

import { useState, useEffect } from "react";
import type { DashboardStats, TimeRangeFilter } from "@/types/dashboard";
import { fetchDashboardStats } from "@/lib/api/home-dashboard";

export function useHomeStats(
  filter: TimeRangeFilter,
  refreshInterval: number = 30000, // 30 seconds default
) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats(filter);
        if (isMounted) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch stats"),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadStats();

    // Set up auto-refresh
    if (refreshInterval > 0) {
      intervalId = setInterval(loadStats, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [filter, refreshInterval]);

  return { stats, loading, error, refresh: () => fetchDashboardStats(filter) };
}