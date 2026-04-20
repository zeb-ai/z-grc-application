import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LogsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">View and analyze system logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Viewer</CardTitle>
          <CardDescription>Real-time system logs and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-150 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Log viewer component will be rendered here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
