import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Quota } from "@/database/entities/Quota.entity";
import { initializeDatabase } from "@/lib/db";

const ConsumeQuotaSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  policy_id: z.string().min(1, "policy_id is required"), // This is group_id
  cost: z.number().positive("cost must be a positive number"),
});

// POST /api/quota/consume - Consume cost and update quota
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = ConsumeQuotaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { user_id, policy_id, cost } = validationResult.data;
    const group_id = policy_id;

    const dataSource = await initializeDatabase();
    const quotaRepository = dataSource.getRepository(Quota);

    // Find quota for this user in this group
    const quota = await quotaRepository.findOne({
      where: {
        user_id,
        group_id,
      },
    });

    if (!quota) {
      return NextResponse.json(
        { error: "Quota not found for this user and group" },
        { status: 404 },
      );
    }

    // Update cost
    quota.used_cost = Number(quota.used_cost || 0) + cost;

    await quotaRepository.save(quota);

    // Calculate remaining cost
    const used_cost = Number(quota.used_cost);
    const total_cost = Number(quota.total_cost);
    const remaining_cost = Math.max(0, total_cost - used_cost);

    console.log(
      `Consumed $${cost} for user ${user_id} in group ${group_id}. Used: $${used_cost}, Remaining: $${remaining_cost}`,
    );

    return NextResponse.json({
      used_cost,
      remaining_cost,
      total_cost,
    });
  } catch (error) {
    console.error("Failed to consume quota:", error);
    return NextResponse.json(
      {
        error: "Failed to consume quota",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
