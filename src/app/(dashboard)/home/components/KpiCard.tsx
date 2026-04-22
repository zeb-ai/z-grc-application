"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    period: string;
  };
  status?: "success" | "warning" | "danger" | "neutral";
  loading?: boolean;
  unit?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  status = "neutral",
  loading,
  unit,
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    success: "text-green-500 dark:text-green-400",
    warning: "text-yellow-500 dark:text-yellow-400",
    danger: "text-red-500 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  const statusBorderColors = {
    success: "border-green-500/20 dark:border-green-400/20",
    warning: "border-yellow-500/20 dark:border-yellow-400/20",
    danger: "border-red-500/20 dark:border-red-400/20",
    neutral: "border-border/40",
  };

  const trendColors = {
    up: "text-green-600 dark:text-green-400 bg-green-500/10",
    down: "text-red-600 dark:text-red-400 bg-red-500/10",
    neutral: "text-gray-600 dark:text-gray-400 bg-gray-500/10",
  };

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <Card
      className={cn(
        "border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200 hover:shadow-md",
        statusBorderColors[status],
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={cn("h-4 w-4", statusColors[status])} />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </div>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium inline-flex w-fit",
              trendColors[trend.direction],
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>
              {trend.value > 0 ? "+" : ""}
              {trend.value.toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}