export interface DashboardStats {
  totalGroups: number;
  totalCostSpent: number;
}

export interface TopCostUsage {
  userId: string;
  userName: string;
  userEmail: string;
  groupId: number;
  groupName: string;
  costUsed: number;
  totalAllocated: number;
  usagePercentage: number;
}

export interface ApplicationError {
  serviceName: string;
  totalErrors: number;
  errorRate: number;
  lastErrorTime: Date;
  totalRequests: number;
}