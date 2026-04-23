"use client";

import { useState, useEffect } from "react";
import type { TopCostUsage } from "@/types/dashboard";

export function useTopCostUsage(limit: number = 10, refreshInterval: number = 60000) {
  const [data, setData] = useState<TopCostUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/home/top-cost-usage?limit=${limit}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const result = await response.json();

        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch cost usage"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    if (refreshInterval > 0) {
      intervalId = setInterval(loadData, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [limit, refreshInterval]);

  return { data, loading, error };
}