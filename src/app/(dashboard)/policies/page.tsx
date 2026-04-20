import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PoliciesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
        <p className="text-muted-foreground">
          Create and manage governance policies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Management</CardTitle>
          <CardDescription>
            Configure policies to control LLM usage and governance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-150 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Policy creation form will be rendered here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
