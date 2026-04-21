"use client";

import {
  ArrowLeft,
  Calendar,
  Coins,
  Trash2,
  Users,
  Shield,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AddMemberDrawer } from "@/components/groups/AddMemberDrawer";
import { MembersTable } from "@/components/groups/MembersTable";
import { GroupDetailSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import type { Group, GroupMember } from "@/types/group";

export default function UserGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number.parseInt(params.id as string, 10);

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    can,
    role,
    isSuperadmin,
    loading: permissionsLoading,
  } = usePermissions(groupId);

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();

      if (res.ok) {
        setGroup(data.group);
      } else {
        toast.error(data.error || "Failed to fetch group details");
        if (res.status === 404) {
          setTimeout(() => router.push("/user-groups"), 2000);
        }
      }
    } catch (error) {
      console.error("Failed to fetch group:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [groupId, router]);

  useEffect(() => {
    if (!Number.isNaN(groupId)) {
      fetchGroupDetails();
    }
  }, [groupId, fetchGroupDetails]);

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Group deleted successfully");
        router.push("/user-groups");
      } else {
        toast.error(data.error || "Failed to delete group");
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Network error");
    }
  };

  const handleMembersAdded = () => {
    // Refresh group details to show new members
    fetchGroupDetails();
  };

  if (loading) {
    return <GroupDetailSkeleton />;
  }

  if (!group) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The user group you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/user-groups")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/user-groups")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {group.name}
              </h1>
              {!permissionsLoading && role && (
                <Badge
                  variant={
                    isSuperadmin
                      ? "default"
                      : role === "admin"
                        ? "destructive"
                        : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  {isSuperadmin ? "SuperAdmin" : role}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Created by {group.creator?.name || "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {can("members.add") && (
            <AddMemberDrawer
              groupId={groupId}
              onMembersAdded={handleMembersAdded}
            />
          )}
          {can("groups.delete") && (
            <Button variant="destructive" onClick={handleDeleteGroup}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Group
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {group.members?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Default Cost Limit
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(group.default_cost_limit).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per member</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(group.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(group.created_at).getFullYear()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members & Quota Management</CardTitle>
        </CardHeader>
        <CardContent>
          {group.members && group.members.length > 0 ? (
            <MembersTable
              members={group.members}
              groupId={groupId}
              onMemberRemoved={fetchGroupDetails}
              onQuotaUpdated={fetchGroupDetails}
              canManageQuota={can("quota.manage")}
              canRemoveMembers={can("members.remove")}
            />
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add members to this group to get started
              </p>
              <AddMemberDrawer
                groupId={groupId}
                onMembersAdded={handleMembersAdded}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
