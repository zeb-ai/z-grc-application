"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { areaChartOptions, getChartTheme } from "./chart-config";
import type { ErrorRateData } from "@/types/dashboard";
import { AlertCircle } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ErrorRateChartProps {
  data: ErrorRateData | null;
  loading?: boolean;
}

export function ErrorRateChart({ data, loading }: ErrorRateChartProps) {
  if (loading || !data) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Error Rate</CardTitle>
          <CardDescription>Error percentage over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const theme = getChartTheme();

  const chartData = {
    labels: data.timeSeries.map((point) => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Error Rate (%)",
        data: data.timeSeries.map((point) => point.value),
        borderColor: theme.danger,
        backgroundColor: theme.danger.replace("1)", "0.1)"),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: theme.danger,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const isHealthy = data.currentRate < 1;
  const isWarning = data.currentRate >= 1 && data.currentRate < 5;
  const isCritical = data.currentRate >= 5;

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Error percentage over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              {isCritical && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <div className="text-2xl font-bold">
                {data.currentRate.toFixed(2)}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {data.incidents} errors
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        <Line data={chartData} options={areaChartOptions} />
      </CardContent>
    </Card>
  );
}