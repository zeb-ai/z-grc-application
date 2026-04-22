"use client";

import { useEffect, useState } from "react";
import type { GroupRole, Permission } from "@/types/rbac";

interface PermissionContext {
  role: GroupRole | null;
  isSuperadmin: boolean;
  loading: boolean;
  can: (permission: Permission) => boolean;
  cannot: (permission: Permission) => boolean;
  isAdmin: boolean;
  isMember: boolean;
}

/**
 * Hook to check user permissions within a specific group
 * Uses the RBAC config to determine what actions the user can perform
 *
 * Usage:
 * const { can, role, isAdmin } = usePermissions(groupId);
 *
 * if (can('members.add')) {
 *   // Show "Add Member" button
 * }
 */
export function usePermissions(groupId: number): PermissionContext {
  const [role, setRole] = useState<GroupRole | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        setLoading(true);
        const res = await fetch(`/api/groups/${groupId}/permissions`);
        const data = await res.json();

        if (res.ok) {
          setRole(data.role || null);
          setIsSuperadmin(data.isSuperadmin || false);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setLoading(false);
      }
    }

    if (groupId) {
      fetchPermissions();
    }
  }, [groupId]);

  const can = (permission: Permission): boolean => {
    // Superadmin can do everything
    if (isSuperadmin) return true;

    // No role = no permissions
    if (!role) return false;

    // Check based on role
    if (role === "admin") {
      return ADMIN_PERMISSIONS.includes(permission);
    }

    if (role === "member") {
      return MEMBER_PERMISSIONS.includes(permission);
    }

    return false;
  };

  const cannot = (permission: Permission): boolean => {
    return !can(permission);
  };

  return {
    role,
    isSuperadmin,
    loading,
    can,
    cannot,
    isAdmin: role === "admin" || isSuperadmin,
    isMember: role === "member",
  };
}

// Permission definitions (matching rbac.yaml)
const ADMIN_PERMISSIONS: Permission[] = [
  "groups.view",
  "groups.edit",
  "groups.delete",
  "groups.settings.view",
  "groups.settings.manage",
  "members.view",
  "members.view_details",
  "members.add",
  "members.remove",
  "members.edit_role",
  "quota.view_own",
  "quota.view_all",
  "quota.manage",
  "analytics.view",
  "reports.view",
  "reports.export",
];

const MEMBER_PERMISSIONS: Permission[] = [
  "groups.view",
  "groups.settings.view",
  "members.view",
  "members.view_details",
  "quota.view_own",
  "quota.view_all",
  "analytics.view",
  "reports.view",
];
