"use client";

import { Coins, MoreVertical, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GroupMember } from "@/types/group";
import { EditQuotaDrawer } from "./EditQuotaDrawer";

interface MembersTableProps {
  members: GroupMember[];
  groupId: string;
  onMemberRemoved: () => void;
  onQuotaUpdated: () => void;
  canManageQuota?: boolean;
  canRemoveMembers?: boolean;
}

export function MembersTable({
  members,
  groupId,
  onMemberRemoved,
  onQuotaUpdated,
  canManageQuota = false,
  canRemoveMembers = false,
}: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null,
  );
  const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);

  const filteredMembers = members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user?.name?.toLowerCase().includes(searchLower) ||
      member.user?.email?.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  });

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Member removed successfully");
        onMemberRemoved();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Network error");
    }
  };

  const handleEditQuota = (member: GroupMember) => {
    setSelectedMember(member);
    setQuotaDialogOpen(true);
  };

  const handleQuotaUpdated = () => {
    setQuotaDialogOpen(false);
    setSelectedMember(null);
    onQuotaUpdated();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-2 border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredMembers.length} member
          {filteredMembers.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cost Budget</TableHead>
              <TableHead className="text-right">Cost Used</TableHead>
              <TableHead className="text-right">Cost Remaining</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchQuery
                      ? "No members found matching your search"
                      : "No members in this group yet"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user?.name || (
                      <span className="text-muted-foreground italic">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{member.user?.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="capitalize">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {member.quota?.total_cost !== undefined ? (
                      <span className="font-semibold text-lg">
                        ${member.quota.total_cost}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {member.quota?.used_cost !== undefined ? (
                      <span
                        className={
                          member.quota.used_cost >= member.quota.total_cost
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        ${member.quota.used_cost}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {member.quota?.total_cost !== undefined &&
                    member.quota?.used_cost !== undefined ? (
                      <span
                        className={
                          member.quota.total_cost - member.quota.used_cost < 1
                            ? "text-red-600 font-semibold"
                            : "text-green-600"
                        }
                      >
                        $
                        {Math.max(
                          0,
                          member.quota.total_cost - member.quota.used_cost,
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {(canManageQuota || canRemoveMembers) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canManageQuota && (
                            <DropdownMenuItem
                              onClick={() => handleEditQuota(member)}
                            >
                              <Coins className="mr-2 h-4 w-4" />
                              Manage Quota
                            </DropdownMenuItem>
                          )}
                          {canRemoveMembers && (
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Quota Drawer */}
      {selectedMember && (
        <EditQuotaDrawer
          open={quotaDialogOpen}
          onOpenChange={setQuotaDialogOpen}
          member={selectedMember}
          groupId={groupId}
          onSuccess={handleQuotaUpdated}
        />
      )}
    </div>
  );
}
