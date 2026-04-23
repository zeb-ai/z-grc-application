import { type NextRequest, NextResponse } from "next/server";
import { Quota } from "@/database/entities/Quota.entity";
import { User } from "@/database/entities/User.entity";
import { Group } from "@/database/entities/Group.entity";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

export const GET = withAuthRequired<any>(async (request: NextRequest, _context) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const dataSource = await initializeDatabase();
    const quotaRepository = dataSource.getRepository(Quota);
    const userRepository = dataSource.getRepository(User);
    const groupRepository = dataSource.getRepository(Group);

    const quotas = await quotaRepository.find();

    const quotasWithDetails = await Promise.all(
      quotas.map(async (quota) => {
        const user = await userRepository.findOne({
          where: { user_id: quota.user_id },
        });

        const group = await groupRepository.findOne({
          where: { group_id: quota.group_id },
        });

        return {
          quota,
          user,
          group,
        };
      }),
    );

    const topCostUsage = quotasWithDetails
      .filter((item) => item.user && item.group)
      .sort((a, b) => parseFloat(b.quota.used_cost.toString()) - parseFloat(a.quota.used_cost.toString()))
      .slice(0, limit)
      .map((item) => {
        const totalAllocated = item.quota.total_cost || item.group!.default_cost_limit || 0;
        const usedCost = parseFloat(item.quota.used_cost.toString());
        const totalAllocatedNum = parseFloat(totalAllocated.toString());
        const usagePercentage = totalAllocatedNum > 0 ? (usedCost / totalAllocatedNum) * 100 : 0;

        return {
          userId: item.quota.user_id,
          userName: item.user!.name,
          userEmail: item.user!.email,
          groupId: item.quota.group_id,
          groupName: item.group!.name,
          costUsed: usedCost,
          totalAllocated: totalAllocatedNum,
          usagePercentage,
        };
      });

    return NextResponse.json(topCostUsage);
  } catch (error) {
    console.error("Failed to fetch top cost usage:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch top cost usage",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});