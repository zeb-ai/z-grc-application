"use client";

import { useState, useEffect } from "react";
import type { SystemHealth } from "@/types/dashboard";
import { fetchSystemHealth } from "@/lib/api/home-dashboard";

export function useSystemHealth(refreshInterval: number = 30000) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const loadHealth = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemHealth();
        if (isMounted) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch health"),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHealth();

    if (refreshInterval > 0) {
      intervalId = setInterval(loadHealth, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval]);

  return { health, loading, error, refresh: fetchSystemHealth };
}