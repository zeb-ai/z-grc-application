import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { User } from "@/database/entities/User.entity";
import { UserGroup } from "@/database/entities/UserGroup.entity";
import type { GroupRole, Permission, RBACConfig } from "@/types/rbac";
import { initializeDatabase } from "./db";

// Cache for RBAC config
let cachedConfig: RBACConfig | null = null;

/**
 * Load and parse RBAC configuration from YAML file
 */
export function loadRBACConfig(): RBACConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = path.join(process.cwd(), "src", "config", "rbac.yaml");
    const fileContents = fs.readFileSync(configPath, "utf8");
    cachedConfig = yaml.load(fileContents) as RBACConfig;
    return cachedConfig;
  } catch (error) {
    console.error("Failed to load RBAC config:", error);
    throw new Error("RBAC configuration could not be loaded");
  }
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: GroupRole,
  permission: Permission,
): boolean {
  const config = loadRBACConfig();
  const roleConfig = config.group_roles[role];

  if (!roleConfig) {
    return false;
  }

  // Check for wildcard permission
  if (roleConfig.permissions.includes("*" as Permission)) {
    return true;
  }

  return roleConfig.permissions.includes(permission);
}

/**
 * Get all permissions for a specific role
 */
export function getPermissions(role: GroupRole): Permission[] {
  const config = loadRBACConfig();
  const roleConfig = config.group_roles[role];

  if (!roleConfig) {
    return [];
  }

  return roleConfig.permissions;
}

/**
 * Check if a user is a superadmin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { user_id: userId } as any,
    });

    return user?.is_superadmin || false;
  } catch (error) {
    console.error("Error checking superadmin status:", error);
    return false;
  }
}

/**
 * Get user's role in a specific group
 */
export async function getUserGroupRole(
  userId: string,
  groupId: number,
): Promise<GroupRole | null> {
  try {
    const dataSource = await initializeDatabase();
    const userGroupRepository = dataSource.getRepository(UserGroup);

    const userGroup = await userGroupRepository.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
      } as any,
    });

    return userGroup?.role as GroupRole | null;
  } catch (error) {
    console.error("Error getting user group role:", error);
    return null;
  }
}

/**
 * Main permission check function
 * Checks if a user can perform an action in a specific group
 */
export async function canPerform(
  userId: string,
  groupId: number,
  permission: Permission,
): Promise<boolean> {
  try {
    // 1. Check if user is superadmin (bypasses all checks)
    const isSuperadmin = await isSuperAdmin(userId);
    if (isSuperadmin) {
      return true;
    }

    // 2. Get user's role in the group
    const role = await getUserGroupRole(userId, groupId);
    if (!role) {
      return false; // User is not a member of the group
    }

    // 3. Check if the role has the required permission
    return hasPermission(role, permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Check if user can perform action without group context
 * (For application-level permissions)
 */
export async function canPerformGlobal(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  try {
    // Only superadmin can perform global actions
    return await isSuperAdmin(userId);
  } catch (error) {
    console.error("Error checking global permission:", error);
    return false;
  }
}

/**
 * Get user's permission context for a group
 * Useful for frontend to get all info at once
 */
export async function getUserPermissionContext(
  userId: string,
  groupId: number,
) {
  const isSuperadmin = await isSuperAdmin(userId);
  const role = await getUserGroupRole(userId, groupId);

  return {
    userId,
    groupId,
    isSuperadmin,
    role,
    permissions: role ? getPermissions(role) : [],
    canPerform: async (permission: Permission) => {
      if (isSuperadmin) return true;
      if (!role) return false;
      return hasPermission(role, permission);
    },
  };
}
