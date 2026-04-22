"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Users,
  Key,
  Shield,
  AlertTriangle,
  Activity,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const activityIcons: Record<string, LucideIcon> = {
  group_created: Shield,
  group_deleted: Shield,
  apikey_generated: Key,
  apikey_revoked: Key,
  quota_warning: AlertTriangle,
  quota_exceeded: XCircle,
  error_spike: AlertCircle,
  high_latency: Activity,
  user_joined: Users,
  user_removed: Users,
};

const severityStyles = {
  success: {
    icon: "text-green-500 dark:text-green-400",
    bg: "bg-green-500/10 dark:bg-green-400/10",
    border: "border-green-500/20 dark:border-green-400/20",
  },
  info: {
    icon: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    border: "border-blue-500/20 dark:border-blue-400/20",
  },
  warning: {
    icon: "text-yellow-500 dark:text-yellow-400",
    bg: "bg-yellow-500/10 dark:bg-yellow-400/10",
    border: "border-yellow-500/20 dark:border-yellow-400/20",
  },
  error: {
    icon: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10 dark:bg-red-400/10",
    border: "border-red-500/20 dark:border-red-400/20",
  },
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""} ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function RecentActivityCard({
  activities,
  loading,
}: RecentActivityCardProps) {
  if (loading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system events and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || Info;
            const styles = severityStyles[activity.severity];

            const content = (
              <div
                className={cn(
                  "flex items-start gap-4 p-3 rounded-lg border transition-colors",
                  styles.border,
                  styles.bg,
                  activity.link && "hover:bg-opacity-20 cursor-pointer",
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 p-2 rounded-lg",
                    styles.icon,
                    styles.bg,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground tabular-nums">
                  {getRelativeTime(activity.timestamp)}
                </div>
              </div>
            );

            if (activity.link) {
              return (
                <Link key={activity.id} href={activity.link}>
                  {content}
                </Link>
              );
            }

            return <div key={activity.id}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}