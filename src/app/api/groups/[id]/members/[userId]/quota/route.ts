import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Group } from "@/database/entities/Group.entity";
import { Quota } from "@/database/entities/Quota.entity";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

const UpdateQuotaSchema = z.object({
  tokens_remaining: z.number().min(0, "Tokens must be non-negative"),
});

// PATCH /api/groups/[id]/members/[userId]/quota - Update member quota
export const PATCH = withAuthRequired<any>(
  async (
    request: NextRequest,
    context?: { params: Promise<{ id: string; userId: string }> },
  ) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const params = await context?.params;
      if (!params) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const { id, userId } = params;
      const groupId = Number.parseInt(id, 10);

      if (Number.isNaN(groupId)) {
        return NextResponse.json(
          { error: "Invalid group ID" },
          { status: 400 },
        );
      }

      const body = await request.json();
      const validationResult = UpdateQuotaSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: z.treeifyError(validationResult.error),
          },
          { status: 400 },
        );
      }

      const { tokens_remaining } = validationResult.data;

      const dataSource = await initializeDatabase();
      const groupRepository = dataSource.getRepository(Group);
      const quotaRepository = dataSource.getRepository(Quota);

      // Check if group exists
      const group = await groupRepository.findOne({
        where: { group_id: groupId } as any,
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Check if current user is the creator
      if (group.created_by !== currentUser.user_id) {
        return NextResponse.json(
          { error: "Only the group creator can manage quotas" },
          { status: 403 },
        );
      }

      // Find existing quota
      const existingQuota = await quotaRepository.findOne({
        where: {
          user_id: userId,
          group_id: groupId,
        } as any,
      });

      if (existingQuota) {
        // Update existing quota and reset usage
        existingQuota.tokens_remaining = tokens_remaining;
        existingQuota.tokens_used = 0; // Reset usage when admin adjusts quota
        await quotaRepository.save(existingQuota);

        return NextResponse.json({
          message: "Quota updated successfully",
          quota: existingQuota,
        });
      }

      // Create new quota if doesn't exist
      const newQuota = quotaRepository.create({
        user_id: userId,
        group_id: groupId,
        tokens_remaining,
        tokens_used: 0,
        id: Date.now(),
      });

      await quotaRepository.save(newQuota);

      return NextResponse.json(
        {
          message: "Quota created successfully",
          quota: newQuota,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Failed to update quota:", error);
      return NextResponse.json(
        {
          error: "Failed to update quota",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);
