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
import type { RequestVolumeData } from "@/types/dashboard";

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

interface RequestVolumeChartProps {
  data: RequestVolumeData | null;
  loading?: boolean;
}

export function RequestVolumeChart({ data, loading }: RequestVolumeChartProps) {
  if (loading || !data) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Request Volume</CardTitle>
          <CardDescription>Requests per minute over time</CardDescription>
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
        label: "Requests/min",
        data: data.timeSeries.map((point) => point.value),
        borderColor: theme.primary,
        backgroundColor: theme.primary.replace("1)", "0.1)"),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: theme.primary,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>Requests per minute over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{data.average.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">avg req/min</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        <Line data={chartData} options={areaChartOptions} />
      </CardContent>
    </Card>
  );
}