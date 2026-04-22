"use client";

import { useState, useEffect } from "react";
import type { ActivityItem } from "@/types/dashboard";
import { fetchRecentActivity } from "@/lib/api/home-dashboard";

export function useRecentActivity(
  limit: number = 10,
  refreshInterval: number = 60000, // 1 minute
) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchRecentActivity(limit);
        if (isMounted) {
          setActivities(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch activities"),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadActivities();

    if (refreshInterval > 0) {
      intervalId = setInterval(loadActivities, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [limit, refreshInterval]);

  return {
    activities,
    loading,
    error,
    refresh: () => fetchRecentActivity(limit),
  };
}