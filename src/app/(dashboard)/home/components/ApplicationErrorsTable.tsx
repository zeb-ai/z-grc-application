import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplicationError } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface ApplicationErrorsTableProps {
  data: ApplicationError[];
  loading?: boolean;
}

function getErrorRateColor(rate: number): string {
  if (rate > 5) return "text-red-600 dark:text-red-400 font-semibold";
  if (rate > 1) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

export function ApplicationErrorsTable({ data, loading }: ApplicationErrorsTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead className="text-right">Total Errors</TableHead>
              <TableHead className="text-right">Error Rate</TableHead>
              <TableHead className="text-right">Last Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 ml-auto" />
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
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          No errors found, Hope everything fine
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application</TableHead>
            <TableHead className="text-right">Total Errors</TableHead>
            <TableHead className="text-right">Error Rate</TableHead>
            <TableHead className="text-right">Last Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.serviceName}>
              <TableCell>
                <Link
                  href={`/monitoring/telemetry?service=${encodeURIComponent(row.serviceName)}`}
                  className="font-medium hover:underline"
                >
                  {row.serviceName}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={row.totalErrors > 100 ? "destructive" : "secondary"}>
                  {row.totalErrors}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn("font-medium", getErrorRateColor(row.errorRate))}>
                  {row.errorRate.toFixed(2)}%
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDistanceToNow(new Date(row.lastErrorTime), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}