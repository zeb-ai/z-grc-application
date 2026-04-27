import { type NextRequest, NextResponse } from "next/server";
import { Group } from "@/database/entities/Group.entity";
import { UserGroup } from "@/database/entities/UserGroup.entity";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

// DELETE /api/groups/[id]/members/[userId] - Remove member from group
export const DELETE = withAuthRequired<any>(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; userId: string }> },
  ) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id, userId } = await params;
      const groupId = id;

      const dataSource = await initializeDatabase();
      const groupRepository = dataSource.getRepository(Group);
      const userGroupRepository = dataSource.getRepository(UserGroup);

      // Check if group exists
      const group = await groupRepository.findOne({
        where: { group_id: groupId },
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Check if current user is the creator
      if (group.created_by !== currentUser.user_id) {
        return NextResponse.json(
          { error: "Only the group creator can remove members" },
          { status: 403 },
        );
      }

      // Find and remove the member
      const userGroup = await userGroupRepository.findOne({
        where: {
          user_id: userId,
          group_id: groupId,
        },
      });

      if (!userGroup) {
        return NextResponse.json(
          { error: "User is not a member of this group" },
          { status: 404 },
        );
      }

      await userGroupRepository.remove(userGroup);

      return NextResponse.json({
        message: "Member removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      return NextResponse.json(
        {
          error: "Failed to remove member",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);
