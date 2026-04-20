import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MetricsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
        <p className="text-muted-foreground">
          Monitor system performance and metrics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrics Dashboard</CardTitle>
          <CardDescription>
            Real-time performance metrics and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-150 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Metrics dashboard component will be rendered here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
