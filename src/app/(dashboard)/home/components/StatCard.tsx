import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}

export function StatCard({ title, value, icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>
    </Card>
  );
}