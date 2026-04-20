"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Group } from "@/types/group";

interface CreateGroupDialogProps {
  onGroupCreated?: (group: Group) => void;
}

export function CreateGroupDialog({ onGroupCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    default_tokens: 1000000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Group created successfully");
        setOpen(false);
        setFormData({ name: "", default_tokens: 1000000 });
        if (onGroupCreated) {
          onGroupCreated(data.group);
        }
      } else {
        toast.error(data.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-5 w-5" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create User Group</DialogTitle>
            <DialogDescription>
              Create a new user group to manage permissions and token.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Engineering Team"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                minLength={3}
                maxLength={255}
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="default_tokens">Default Tokens</Label>
              <Input
                id="default_tokens"
                type="number"
                placeholder="1,000,000"
                value={formData.default_tokens}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_tokens: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
                required
                min={0}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Number of tokens each member receives by default
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
