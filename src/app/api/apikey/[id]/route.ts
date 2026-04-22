import { type NextRequest, NextResponse } from "next/server";
import { GrcKey } from "@/database/entities/GrcKey.entity";
import { UserGroup } from "@/database/entities/UserGroup.entity";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

// DELETE /api/apikey/[id] - Delete a GRC key
export const DELETE = withAuthRequired<any>(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;

      const dataSource = await initializeDatabase();
      const grcKeyRepository = dataSource.getRepository(GrcKey);
      const userGroupRepository = dataSource.getRepository(UserGroup);

      // Find the key by id
      const key = await grcKeyRepository.findOne({
        where: { id },
      });

      if (!key) {
        console.error(`Key not found: ${id}`);
        return NextResponse.json(
          { error: "GRC key not found" },
          { status: 404 },
        );
      }

      // Verify user is member of the group
      const membership = await userGroupRepository.findOne({
        where: {
          user_id: user.user_id,
          group_id: key.group_id,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "You are not authorized to delete this key" },
          { status: 403 },
        );
      }

      // Delete the key
      await grcKeyRepository.remove(key);

      return NextResponse.json({
        message: "GRC key deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete GRC key:", error);
      return NextResponse.json(
        {
          error: "Failed to delete GRC key",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);
