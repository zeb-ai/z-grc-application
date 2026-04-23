import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopCostUsage } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface TopCostUsageTableProps {
  data: TopCostUsage[];
  loading?: boolean;
}

export function TopCostUsageTable({ data, loading }: TopCostUsageTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Group Name</TableHead>
              <TableHead className="text-right">Cost Used</TableHead>
              <TableHead className="text-right">Total Allocated</TableHead>
              <TableHead className="text-right">Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No cost data available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Group Name</TableHead>
            <TableHead className="text-right">Cost Used</TableHead>
            <TableHead className="text-right">Total Allocated</TableHead>
            <TableHead className="text-right">Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const usageColor =
              row.usagePercentage > 90
                ? "text-red-600 dark:text-red-400"
                : row.usagePercentage > 75
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400";

            return (
              <TableRow key={`${row.userId}-${row.groupId}`}>
                <TableCell>
                  <div>
                    <div className="font-medium">{row.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {row.userEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/user-groups/${row.groupId}`}
                    className="hover:underline"
                  >
                    {row.groupName}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${row.costUsed.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${row.totalAllocated.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className={cn("text-sm font-medium min-w-[3rem]", usageColor)}>
                      {row.usagePercentage.toFixed(1)}%
                    </span>
                    <Progress
                      value={Math.min(row.usagePercentage, 100)}
                      className="w-20"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}