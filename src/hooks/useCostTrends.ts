"use client";

import { useState, useEffect } from "react";
import type {
  CostDistributionData,
  RequestVolumeData,
  ErrorRateData,
  LogDistribution,
  TimeRangeFilter,
} from "@/types/dashboard";
import {
  fetchCostDistribution,
  fetchRequestVolume,
  fetchErrorRate,
  fetchLogDistribution,
} from "@/lib/api/home-dashboard";

export function useCostTrends(
  filter: TimeRangeFilter,
  refreshInterval: number = 60000,
) {
  const [costDistribution, setCostDistribution] = useState<
    CostDistributionData[]
  >([]);
  const [requestVolume, setRequestVolume] = useState<RequestVolumeData | null>(
    null,
  );
  const [errorRate, setErrorRate] = useState<ErrorRateData | null>(null);
  const [logDistribution, setLogDistribution] =
    useState<LogDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const loadTrends = async () => {
      try {
        setLoading(true);
        const [cost, volume, errors, logs] = await Promise.all([
          fetchCostDistribution(),
          fetchRequestVolume(filter),
          fetchErrorRate(filter),
          fetchLogDistribution(filter),
        ]);

        if (isMounted) {
          setCostDistribution(cost);
          setRequestVolume(volume);
          setErrorRate(errors);
          setLogDistribution(logs);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch trends"),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTrends();

    if (refreshInterval > 0) {
      intervalId = setInterval(loadTrends, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [filter, refreshInterval]);

  return {
    costDistribution,
    requestVolume,
    errorRate,
    logDistribution,
    loading,
    error,
  };
}