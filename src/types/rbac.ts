// RBAC Type Definitions

export type GroupRole = "admin" | "member";

export type Permission =
  // Group Permissions
  | "groups.view"
  | "groups.edit"
  | "groups.delete"
  | "groups.settings.view"
  | "groups.settings.manage"
  // Member Permissions
  | "members.view"
  | "members.view_details"
  | "members.add"
  | "members.remove"
  | "members.edit_role"
  // Quota Permissions
  | "quota.view_own"
  | "quota.view_all"
  | "quota.manage"
  // Analytics & Reports
  | "analytics.view"
  | "reports.view"
  | "reports.export"
  // Wildcard for superadmin
  | "*";

export interface RoleConfig {
  description: string;
  permissions: Permission[];
}

export interface RBACConfig {
  application_roles: {
    superadmin: RoleConfig;
  };
  group_roles: {
    admin: RoleConfig;
    member: RoleConfig;
  };
  permission_descriptions?: Record<string, string>;
}

export interface PermissionCheckContext {
  userId: string;
  groupId?: number;
  isSuperadmin?: boolean;
  groupRole?: GroupRole;
}
