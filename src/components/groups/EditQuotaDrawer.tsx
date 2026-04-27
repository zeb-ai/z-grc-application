"use client";

import {
  Activity,
  DollarSign,
  Mail,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { GroupMember } from "@/types/group";

interface EditQuotaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: GroupMember;
  groupId: string;
  onSuccess: () => void;
}

export function EditQuotaDrawer({
  open,
  onOpenChange,
  member,
  groupId,
  onSuccess,
}: EditQuotaDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [costToAdd, setCostToAdd] = useState(0);

  const currentCost = member.quota?.total_cost || 0;
  const costUsed = member.quota?.used_cost || 0;
  const newTotal = Math.max(0, currentCost + costToAdd);
  const usagePercentage =
    currentCost > 0 ? Math.round((costUsed / currentCost) * 100) : 0;
  const remainingCost = Math.max(0, currentCost - costUsed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `/api/groups/${groupId}/members/${member.user_id}/quota`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_cost: newTotal,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Cost quota updated successfully");
        onSuccess();
        onOpenChange(false);
        setCostToAdd(0);
      } else {
        toast.error(data.error || "Failed to update quota");
      }
    } catch (error) {
      console.error("Failed to update quota:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
        <div className="flex flex-col h-full">
          <DrawerHeader className="text-left">
            <DrawerTitle>Manage Cost Quota</DrawerTitle>
            <DrawerDescription>
              Update cost allocation and view usage statistics
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleSubmit} id="quota-form" className="space-y-6">
              {/* Member Info Section */}
              <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {member.user?.name || "Pending User"}
                      </h3>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {member.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{member.user?.email || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Current Usage</h3>
                </div>
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usage Progress</span>
                    <span className="text-sm font-bold">
                      {usagePercentage}%
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Cost Used</p>
                      <p className="text-lg font-bold font-mono text-red-600">
                        ${costUsed}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-lg font-bold font-mono text-green-600">
                        ${remainingCost}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Total Cost Budget</h3>
                </div>
                <div className="rounded-lg border p-4 bg-primary/5">
                  <p className="text-3xl font-bold font-mono">${currentCost}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current budget limit
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Adjust Budget</h3>

                <div className="grid gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-mono text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="costToAdd"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount (use negative to reduce)"
                      value={costToAdd === 0 ? "" : costToAdd}
                      onChange={(e) =>
                        setCostToAdd(Number.parseFloat(e.target.value) || 0)
                      }
                      disabled={loading}
                      autoFocus
                      className="text-2xl font-mono p-4 h-13 pl-8 border-2 border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a positive number to add budget or negative to reduce
                  </p>
                </div>

                {/* Quick Add Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Quick Add
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCostToAdd(costToAdd + amount)}
                        disabled={loading}
                        className="text-xs"
                      >
                        +${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* New Total Preview */}
                {costToAdd !== 0 && (
                  <div className="rounded-lg border-2 p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        New Total Budget
                      </span>
                      <div className="flex items-center gap-2">
                        {costToAdd > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-3xl font-bold font-mono">${newTotal}</p>
                    {costToAdd > 0 ? (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Adding ${costToAdd}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Removing ${Math.abs(costToAdd)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          <DrawerFooter className="pt-4 border-t">
            <Button
              type="submit"
              form="quota-form"
              disabled={loading || costToAdd === 0}
              className="w-full"
            >
              {loading ? "Updating..." : "Update Quota"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" disabled={loading}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
