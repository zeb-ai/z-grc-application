"use client";

import { Key, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateKeyDrawer } from "@/components/grc-keys/CreateKeyDrawer";
import { KeysTableSkeleton } from "@/components/grc-keys/KeysTableSkeleton";
import type { GrcKey } from "@/database/entities/GrcKey.entity";

interface Group {
  group_id: number;
  name: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<GrcKey[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchKeys();
  }, []);

  const fetchGroups = async () => {
    try {
      // Fetch only groups the user belongs to
      const res = await fetch("/api/groups?my_groups=true");
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const fetchKeys = async (groupId?: string) => {
    try {
      setLoading(true);
      const url =
        groupId && groupId !== "all"
          ? `/api/apikey?group_id=${groupId}`
          : "/api/apikey";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setKeys(data.keys || []);
      }
    } catch (error) {
      console.error("Failed to fetch keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    fetchKeys(value);
  };

  const handleKeyCreated = () => {
    setIsCreateOpen(false);
    fetchKeys(selectedGroup);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            GRC Configuration Keys
          </h1>
          <p className="text-muted-foreground">
            Manage configuration keys for GRC SDK integration
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedGroup} onValueChange={handleGroupChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem
                key={group.group_id}
                value={group.group_id.toString()}
              >
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configuration Keys
          </CardTitle>
          <CardDescription>
            Keys are scoped to user groups and used for SDK integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <KeysTableSkeleton />
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No keys found. Create your first configuration key.
            </div>
          ) : (
            <div className="w-full">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead className="w-1/3">Group</TableHead>
                    <TableHead className="w-1/3">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-primary" />
                          <div>
                            <p>{key.name}</p>
                            {key.description && (
                              <p className="text-xs text-muted-foreground">
                                {key.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {groups.find((g) => g.group_id === key.group_id)
                          ?.name || key.group_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateKeyDrawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleKeyCreated}
        groups={groups}
      />
    </div>
  );
}
