import { type NextRequest, NextResponse } from "next/server";
import { Group } from "@/database/entities/Group.entity";
import { Quota } from "@/database/entities/Quota.entity";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

export const GET = withAuthRequired<any>(async (_request: NextRequest, _context) => {
  try {
    const dataSource = await initializeDatabase();
    const groupRepository = dataSource.getRepository(Group);
    const quotaRepository = dataSource.getRepository(Quota);

    const totalGroups = await groupRepository.count();

    const quotas = await quotaRepository.find();
    const totalCostSpent = quotas.reduce(
      (sum, quota) => sum + parseFloat(quota.used_cost.toString()),
      0,
    );

    return NextResponse.json({
      totalGroups,
      totalCostSpent,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard overview:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard overview",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});