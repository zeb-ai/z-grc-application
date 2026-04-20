export interface Group {
  group_id: number;
  name: string;
  created_by: string;
  default_tokens: number;
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
  group_id: number;
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
    tokens_remaining: number;
    tokens_allocated: number;
    tokens_used: number;
  };
}

export interface CreateGroupDto {
  name: string;
  default_tokens: number;
}

export interface UpdateGroupDto {
  name?: string;
  default_tokens?: number;
}

export interface AddMemberDto {
  email: string;
  role: "admin" | "member" | "viewer";
  allowPending?: boolean;
}

export interface UpdateQuotaDto {
  tokens_remaining: number;
}

export interface GroupListResponse {
  groups: Group[];
  total: number;
}

export interface GroupDetailResponse {
  group: Group;
}
