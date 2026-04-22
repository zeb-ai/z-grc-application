import { type NextRequest, NextResponse } from "next/server";
import { Group } from "@/database/entities/Group.entity";
import { Quota } from "@/database/entities/Quota.entity";
import { initializeDatabase } from "@/lib/db";

// GET /api/quota/user - Fetch current quota status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const group_id_param = searchParams.get("group_id");

    if (!user_id || !group_id_param) {
      return NextResponse.json(
        { error: "user_id and group_id are required" },
        { status: 400 },
      );
    }

    const group_id = Number.parseInt(group_id_param);

    if (Number.isNaN(group_id)) {
      return NextResponse.json(
        { error: "Invalid group_id format" },
        { status: 400 },
      );
    }

    const dataSource = await initializeDatabase();
    const quotaRepository = dataSource.getRepository(Quota);
    const groupRepository = dataSource.getRepository(Group);

    // Find quota for this user in this group
    const quota = await quotaRepository.findOne({
      where: {
        user_id,
        group_id,
      },
    });

    if (!quota) {
      // User not in group or no quota allocated
      // Return zeros
      return NextResponse.json({
        used_cost: 0,
        remaining_cost: 0,
        total_cost: 0,
      });
    }

    // Calculate cost values
    const used_cost = Number(quota.used_cost || 0);
    const total_cost = Number(quota.total_cost || 0);
    const remaining_cost = Math.max(0, total_cost - used_cost);

    return NextResponse.json({
      used_cost,
      remaining_cost,
      total_cost,
    });
  } catch (error) {
    console.error("Failed to fetch quota:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quota",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
