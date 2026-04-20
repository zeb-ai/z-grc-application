"use client";

import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { UserPlus, X, Mail, Loader2, Shield, ChevronDown } from "lucide-react";

interface User {
  user_id: string;
  email: string;
  name: string;
}

interface SelectedMember {
  email: string;
  role: "admin" | "member";
}

interface AddMemberDrawerProps {
  groupId: number;
  onMembersAdded: () => void;
}

export function AddMemberDrawer({
  groupId,
  onMembersAdded,
}: AddMemberDrawerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        );
        const data = await res.json();

        if (res.ok) {
          setSearchResults(data.users || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Failed to search users:", error);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addMember = (email: string, role: "admin" | "member" = "member") => {
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    if (selectedMembers.some((m) => m.email === email)) {
      toast.error("Email already added");
      return;
    }

    setSelectedMembers([...selectedMembers, { email, role }]);
    setSearchQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeMember = (email: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.email !== email));
  };

  const updateMemberRole = (email: string, role: "admin" | "member") => {
    setSelectedMembers(
      selectedMembers.map((m) => (m.email === email ? { ...m, role } : m)),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      addMember(searchQuery.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMembers.length === 0) {
      toast.error("Please add at least one member");
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.all(
        selectedMembers.map(async (member) => {
          const res = await fetch(`/api/groups/${groupId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: member.email,
              role: member.role,
            }),
          });

          const data = await res.json();
          return { success: res.ok, data, email: member.email };
        }),
      );

      const successCount = results.filter((r) => r.success).length;
      const failedResults = results.filter((r) => !r.success);

      if (successCount > 0) {
        toast.success(
          `${successCount} member${successCount > 1 ? "s" : ""} added successfully`,
        );
        onMembersAdded();
        setOpen(false);
        setSelectedMembers([]);
        setSearchQuery("");
      }

      if (failedResults.length > 0) {
        failedResults.forEach((result) => {
          toast.error(
            `${result.email}: ${result.data.error || "Failed to add"}`,
          );
        });
      }
    } catch (error) {
      console.error("Failed to add members:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "viewer":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      default:
        return "bg-green-500/10 text-green-600 dark:text-green-400";
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Members
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-175 rounded-none">
        <div className="flex flex-col h-full">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add Members to Group</DrawerTitle>
            <DrawerDescription>
              Search existing users or enter new email addresses
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <form
              onSubmit={handleSubmit}
              id="add-members-form"
              className="space-y-6"
            >
              {/* Email Search Input */}
              <div className="space-y-3">
                <Label htmlFor="email-search">Email Address</Label>
                <div className="relative">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Input
                      ref={inputRef}
                      id="email-search"
                      type="text"
                      placeholder="Type email address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() =>
                        searchResults.length > 0 && setShowDropdown(true)
                      }
                      disabled={loading}
                      className="pl-10 pr-10"
                      autoComplete="off"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      {searchResults.map((user) => (
                        <button
                          key={user.user_id}
                          type="button"
                          onClick={() => addMember(user.email)}
                          className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b last:border-b-0"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add New Email */}
                  {showDropdown &&
                    searchQuery.length >= 2 &&
                    searchResults.length === 0 &&
                    !searching && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={() => addMember(searchQuery)}
                          className="w-full px-4 py-3 text-left hover:bg-accent transition-colors"
                        >
                          <p className="text-sm font-medium">
                            Add "{searchQuery}"
                          </p>
                          <p className="text-xs text-muted-foreground">
                            New user will be created
                          </p>
                        </button>
                      </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to add or select from suggestions
                </p>
              </div>

              {/* Selected Members as Pills */}
              {selectedMembers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Selected Members</Label>
                    <Badge variant="secondary">{selectedMembers.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 rounded-lg border-2 bg-muted/30 min-h-15">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.email}
                        className="inline-flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full border-2 bg-background shadow-sm"
                      >
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium max-w-45 truncate">
                          {member.email}
                        </span>

                        {/* Role Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={loading}
                              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity ${getRoleColor(member.role)}`}
                            >
                              <Shield className="h-3 w-3" />
                              {member.role}
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                updateMemberRole(member.email, "member")
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateMemberRole(member.email, "admin")
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeMember(member.email)}
                          disabled={loading}
                          className="ml-1 rounded-full hover:bg-destructive/20 p-1 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>

          <DrawerFooter className="pt-4 border-t">
            <Button
              type="submit"
              form="add-members-form"
              disabled={loading || selectedMembers.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Members...
                </>
              ) : (
                `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? "s" : ""}`
              )}
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
