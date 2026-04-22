"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { doughnutChartOptions, getChartTheme } from "./chart-config";
import type { CostDistributionData } from "@/types/dashboard";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CostDistributionChartProps {
  data: CostDistributionData[];
  loading?: boolean;
}

export function CostDistributionChart({
  data,
  loading,
}: CostDistributionChartProps) {
  if (loading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Cost Distribution</CardTitle>
          <CardDescription>Top 5 groups by usage</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Cost Distribution</CardTitle>
          <CardDescription>Top 5 groups by usage</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No cost data available</p>
        </CardContent>
      </Card>
    );
  }

  const theme = getChartTheme();
  const colors = [
    theme.primary,
    theme.info,
    theme.success,
    theme.warning,
    theme.danger,
  ];

  const chartData = {
    labels: data.map((d) => d.groupName),
    datasets: [
      {
        label: "Cost ($)",
        data: data.map((d) => d.usedCost),
        backgroundColor: colors.map((c) => c.replace("1)", "0.8)")),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Cost Distribution</CardTitle>
        <CardDescription>Top 5 groups by usage</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        <Doughnut data={chartData} options={doughnutChartOptions} />
      </CardContent>
    </Card>
  );
}