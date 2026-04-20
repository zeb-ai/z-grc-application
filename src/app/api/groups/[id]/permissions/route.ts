import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";
import { getUserGroupRole, isSuperAdmin } from "@/lib/rbac";

// GET /api/groups/[id]/permissions - Get current user's permissions for this group
export const GET = withAuthRequired<any>(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;
      const groupId = Number.parseInt(id, 10);

      if (Number.isNaN(groupId)) {
        return NextResponse.json(
          { error: "Invalid group ID" },
          { status: 400 },
        );
      }

      // Check if user is superadmin
      const isSuperadmin = await isSuperAdmin(currentUser.user_id);

      // Get user's role in this group
      const role = await getUserGroupRole(currentUser.user_id, groupId);

      return NextResponse.json({
        role,
        isSuperadmin,
        userId: currentUser.user_id,
      });
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch permissions",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);
