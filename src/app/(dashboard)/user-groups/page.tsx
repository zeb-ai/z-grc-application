"use client";

import { Calendar, Coins, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { GroupsGridSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Group } from "@/types/group";

export default function UserGroupsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchGroups = useCallback(
    async (isSearch = false) => {
      try {
        if (isSearch) {
          setIsSearching(true);
        } else if (isInitialLoad) {
          setLoading(true);
        }

        const url = new URL("/api/groups", window.location.origin);
        if (searchQuery) {
          url.searchParams.append("search", searchQuery);
        }

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          setGroups(data.groups);
        } else {
          toast.error(data.error || "Failed to fetch groups");
        }
      } catch (error) {
        console.error("Failed to fetch groups:", error);
        toast.error("Network error");
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
        setIsSearching(false);
      }
    },
    [searchQuery, isInitialLoad],
  );

  useEffect(() => {
    fetchGroups(false);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      fetchGroups(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleGroupCreated = (group: Group) => {
    setGroups([group, ...groups]);
  };

  const filteredGroups = groups;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">User Groups</h1>
        <p className="text-muted-foreground">
          Manage user groups and their members
        </p>
      </div>

      {/* Search and Create Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <CreateGroupDialog onGroupCreated={handleGroupCreated} />
      </div>

      {/* Content */}
      {loading && isInitialLoad ? (
        <GroupsGridSkeleton count={6} />
      ) : (
        <>
          {isSearching && <GroupsGridSkeleton count={3} />}
          {!isSearching && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <Card
                    key={group.group_id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/user-groups/${group.group_id}`)
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">
                            {group.name}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        Created by {group.creator?.name || "Unknown"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Members</span>
                          </div>
                          <Badge variant="secondary">
                            {group.memberCount || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Coins className="h-4 w-4" />
                            <span>Default Cost Limit</span>
                          </div>
                          <Badge variant="outline">
                            ${group.default_cost_limit}
                          </Badge>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Created:{" "}
                              {new Date(group.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No groups found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Create your first user group to get started"}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
