// Dashboard Statistics Types
export interface DashboardStats {
  totalGroups: number;
  activeApiKeys: number;
  totalCostConsumed: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  totalTraces: number;
  logsPerMinute: number;
}

export interface StatTrend {
  value: number;
  change: number; // percentage change
  direction: "up" | "down" | "neutral";
  period: string; // e.g., "from last hour"
}

export interface KpiCardData {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: StatTrend;
  status?: "success" | "warning" | "danger" | "neutral";
  loading?: boolean;
}

// Recent Activity Types
export type ActivityType =
  | "group_created"
  | "group_deleted"
  | "apikey_generated"
  | "apikey_revoked"
  | "quota_warning"
  | "quota_exceeded"
  | "error_spike"
  | "high_latency"
  | "user_joined"
  | "user_removed";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  severity: "info" | "warning" | "error" | "success";
  metadata?: Record<string, any>;
  link?: string; // Navigation link
}

// System Health Types
export interface HealthMetric {
  name: string;
  value: number; // 0-100 percentage or actual value
  unit?: string; // "ms", "%", "req/s", etc.
  status: "healthy" | "warning" | "critical";
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface SystemHealth {
  apiResponseTime: HealthMetric;
  errorRate: HealthMetric;
  databaseConnection: HealthMetric;
  clickhouseConnection: HealthMetric;
  lastUpdated: Date;
}

// Chart Data Types
export interface TimeSeriesPoint {
  timestamp: Date | string;
  value: number;
  label?: string;
}

export interface CostDistributionData {
  groupId: number;
  groupName: string;
  totalCost: number;
  usedCost: number;
  percentage: number;
}

export interface RequestVolumeData {
  timeSeries: TimeSeriesPoint[];
  total: number;
  peak: number;
  average: number;
}

export interface ErrorRateData {
  timeSeries: TimeSeriesPoint[];
  currentRate: number;
  incidents: number;
}

export interface LogSeverityData {
  severity: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  count: number;
  percentage: number;
  color: string;
}

export interface LogDistribution {
  data: LogSeverityData[];
  total: number;
  errorPercentage: number;
}

// Time Range Filter
export type TimeRange = "1h" | "24h" | "7d" | "30d" | "custom";

export interface TimeRangeFilter {
  range: TimeRange;
  startDate?: Date;
  endDate?: Date;
}

// API Response Types
export interface HomeStatsResponse {
  stats: DashboardStats;
  health: SystemHealth;
  recentActivity: ActivityItem[];
  costDistribution: CostDistributionData[];
  requestVolume: RequestVolumeData;
  errorRate: ErrorRateData;
  logDistribution: LogDistribution;
}

// Chart Configuration
export interface ChartTheme {
  primaryColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
}