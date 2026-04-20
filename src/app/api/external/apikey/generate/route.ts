import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GrcKey } from "@/database/entities/GrcKey.entity";
import { Group } from "@/database/entities/Group.entity";
import { Quota } from "@/database/entities/Quota.entity";
import { User } from "@/database/entities/User.entity";
import { UserGroup } from "@/database/entities/UserGroup.entity";
import { type ApiKeyData, encode } from "@/lib/apikey";
import { initializeDatabase } from "@/lib/db";
import { withServiceAuth } from "@/lib/service-auth-middleware";

const GenerateKeySchema = z.object({
  email: z.string().email("Invalid email address"),
  group_id: z.number().int().positive("Valid group_id is required"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500).optional(),
});

/**
 * POST /api/external/apikey/generate
 * Generate GRC API key for external applications
 * Requires service API key authentication
 */
export const POST = withServiceAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validationResult = GenerateKeySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { email, group_id, name, description } = validationResult.data;

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const groupRepository = dataSource.getRepository(Group);
    const userGroupRepository = dataSource.getRepository(UserGroup);
    const quotaRepository = dataSource.getRepository(Quota);
    const grcKeyRepository = dataSource.getRepository(GrcKey);

    let userCreated = false;
    let memberAdded = false;

    // Step 1: Check if user exists, create if not
    let user = await userRepository.findOne({ where: { email } });

    if (!user) {
      const namePart = email.split("@")[0];
      const { v7: uuidv7 } = await import("uuid");

      user = userRepository.create({
        user_id: uuidv7(),
        email,
        name: namePart,
        is_superadmin: false,
      });

      await userRepository.save(user);
      userCreated = true;

      console.log(`Auto-created user: ${email} (${user.user_id})`);
    }

    // Step 2: Verify group exists
    const group = await groupRepository.findOne({
      where: { group_id },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found", group_id },
        { status: 404 },
      );
    }

    // Step 3: Check if user is member of group, add if not
    let userGroup = await userGroupRepository.findOne({
      where: {
        user_id: user.user_id,
        group_id,
      },
    });

    if (!userGroup) {
      userGroup = userGroupRepository.create({
        id: Date.now(),
        user_id: user.user_id,
        group_id,
        role: "member",
      });

      try {
        await userGroupRepository.save(userGroup);
        memberAdded = true;
        console.log(`Auto-added user ${email} to group ${group_id}`);
      } catch (saveError) {
        console.error("Failed to save UserGroup:", saveError);
        throw new Error(
          `Failed to add user to group: ${saveError instanceof Error ? saveError.message : "Unknown error"}`,
        );
      }
    }

    // Step 4: Check/Create quota for user in group
    let quota = await quotaRepository.findOne({
      where: {
        user_id: user.user_id,
        group_id,
      },
    });

    if (!quota) {
      quota = quotaRepository.create({
        id: Date.now(),
        user_id: user.user_id,
        group_id,
        tokens_remaining: group.default_tokens,
        tokens_used: 0,
      });

      try {
        await quotaRepository.save(quota);
        console.log(
          `Created quota for user ${email} in group ${group_id}: ${group.default_tokens} tokens`,
        );
      } catch (saveError) {
        console.error("Failed to save Quota:", saveError);
        throw new Error(
          `Failed to create quota: ${saveError instanceof Error ? saveError.message : "Unknown error"}`,
        );
      }
    }

    // Step 5: Auto-derive governance URL from request
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const governance_url =
      process.env.GOVERNANCE_URL || `${protocol}://${host}`;
    const otel_endpoint = process.env.OTEL_ENDPOINT || "";

    // Step 6: Create GRC key record
    const grcKey = grcKeyRepository.create({
      name,
      description: description || "",
      user_id: user.user_id,
      group_id,
      governance_url,
      otel_endpoint,
    });

    // Ensure ID is generated before saving
    if (!grcKey.id) {
      const { v7: uuidv7 } = await import("uuid");
      grcKey.id = uuidv7();
    }

    await grcKeyRepository.save(grcKey);

    console.log(
      `Created GRC key "${name}" for ${email} in group ${group_id} (ID: ${grcKey.id})`,
    );

    // Step 7: Generate encoded key
    const keyData: ApiKeyData = {
      uid: user.user_id,
      host: governance_url,
      otel: otel_endpoint,
      gid: group_id.toString(),
    };

    const encodedKey = encode(keyData);

    // Step 8: Return response
    return NextResponse.json(
      {
        success: true,
        key: {
          id: grcKey.id,
          name: grcKey.name,
          description: grcKey.description,
          encoded_key: encodedKey,
          user_id: user.user_id,
          group_id: grcKey.group_id,
          created_at: grcKey.created_at,
        },
        user_created: userCreated,
        member_added: memberAdded,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to generate API key:", error);
    return NextResponse.json(
      {
        error: "Failed to generate API key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});