export interface Group {
  group_id: string;
  name: string;
  created_by: string;
  default_cost_limit: number;
  created_at: Date | string;
  creator?: {
    user_id: string;
    name: string;
    email: string;
  };
  members?: GroupMember[];
  memberCount?: number;
}

export interface GroupMember {
  id: number;
  user_id: string;
  group_id: string;
  role: string;
  joined_at: Date | string;
  status?: "active" | "pending";
  user: {
    user_id: string;
    name: string;
    email: string;
  } | null;
  quota?: {
    id: number;
    total_cost: number;
    used_cost: number;
  };
}

export interface CreateGroupDto {
  name: string;
  default_cost_limit: number;
}

export interface UpdateGroupDto {
  name?: string;
  default_cost_limit?: number;
}

export interface AddMemberDto {
  email: string;
  role: "admin" | "member" | "viewer";
  allowPending?: boolean;
}

export interface UpdateQuotaDto {
  total_cost: number;
}

export interface GroupListResponse {
  groups: Group[];
  total: number;
}

export interface GroupDetailResponse {
  group: Group;
}
