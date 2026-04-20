import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Quota } from "@/database/entities/Quota.entity";
import { initializeDatabase } from "@/lib/db";

const ConsumeQuotaSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  policy_id: z.string().min(1, "policy_id is required"), // This is group_id
  amount: z.number().int().positive("amount must be a positive integer"),
});

// POST /api/quota/consume - Consume tokens and update quota
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

    const { user_id, policy_id, amount } = validationResult.data;
    const group_id = Number.parseInt(policy_id);

    if (Number.isNaN(group_id)) {
      return NextResponse.json(
        { error: "Invalid policy_id format" },
        { status: 400 },
      );
    }

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

    // Update quota
    quota.tokens_used = (quota.tokens_used || 0) + amount;
    quota.tokens_remaining = Math.max(0, quota.tokens_remaining - amount);

    await quotaRepository.save(quota);

    // Calculate and return updated quota status
    const used_quota = quota.tokens_used;
    const monthly_quota = quota.tokens_remaining + used_quota;
    const remaining_quota = quota.tokens_remaining;

    console.log(
      `Consumed ${amount} tokens for user ${user_id} in group ${group_id}. Used: ${used_quota}, Remaining: ${remaining_quota}`,
    );

    return NextResponse.json({
      used_quota,
      remaining_quota,
      monthly_quota,
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
