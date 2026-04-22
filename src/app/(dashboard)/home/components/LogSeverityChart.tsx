"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { barChartOptions } from "./chart-config";
import type { LogDistribution } from "@/types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface LogSeverityChartProps {
  data: LogDistribution | null;
  loading?: boolean;
}

export function LogSeverityChart({ data, loading }: LogSeverityChartProps) {
  if (loading || !data) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Log Severity Distribution</CardTitle>
          <CardDescription>Breakdown by log level</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.data.length === 0) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Log Severity Distribution</CardTitle>
          <CardDescription>Breakdown by log level</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No log data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.data.map((d) => d.severity),
    datasets: [
      {
        label: "Log Count",
        data: data.data.map((d) => d.count),
        backgroundColor: data.data.map((d) => d.color.replace(")", ", 0.8)")),
        borderColor: data.data.map((d) => d.color),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Log Severity Distribution</CardTitle>
            <CardDescription>Breakdown by log level</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {data.total.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">total logs</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        <Bar data={chartData} options={barChartOptions} />
      </CardContent>
    </Card>
  );
}