import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GrcKey } from "@/database/entities/GrcKey.entity";
import { Group } from "@/database/entities/Group.entity";
import { UserGroup } from "@/database/entities/UserGroup.entity";
import { type ApiKeyData, encode } from "@/lib/apikey";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

const CreateKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500).optional(),
  group_id: z.number().int().positive("Valid group_id is required"),
  governance_url: z.url("Governance URL must be valid"),
  otel_endpoint: z.url("OpenTelemetry endpoint must be valid").optional(),
});

// GET /api/apikey - List all GRC keys for user's groups
export const GET = withAuthRequired<any>(async (request: NextRequest, _context) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupIdParam = searchParams.get("group_id");

    const dataSource = await initializeDatabase();
    const grcKeyRepository = dataSource.getRepository(GrcKey);
    const userGroupRepository = dataSource.getRepository(UserGroup);

    // Get all groups user belongs to
    const userGroups = await userGroupRepository.find({
      where: { user_id: user.user_id },
    });

    const groupIds = userGroups.map((ug: any) => ug.group_id);

    if (groupIds.length === 0) {
      return NextResponse.json({ keys: [], total: 0 });
    }

    // Filter by specific group if provided
    let keys: GrcKey[];
    if (groupIdParam) {
      const groupId = Number.parseInt(groupIdParam);
      if (!groupIds.includes(groupId)) {
        return NextResponse.json(
          { error: "You are not a member of this group" },
          { status: 403 },
        );
      }
      keys = await grcKeyRepository.find({
        where: { group_id: groupId },
        order: { created_at: "DESC" },
      });
    } else {
      // Fetch all keys and filter in memory for MongoDB
      const allKeys = await grcKeyRepository.find({
        order: { created_at: "DESC" },
      });
      keys = allKeys.filter((key) => groupIds.includes(key.group_id));
    }

    return NextResponse.json({ keys, total: keys.length });
  } catch (error) {
    console.error("Failed to fetch GRC keys:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch GRC keys",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

// POST /api/apikey - Create new GRC key
export const POST = withAuthRequired<any>(async (request: NextRequest, _context) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = CreateKeySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { name, description, group_id, governance_url, otel_endpoint } =
      validationResult.data;

    const dataSource = await initializeDatabase();
    const grcKeyRepository = dataSource.getRepository(GrcKey);
    const userGroupRepository = dataSource.getRepository(UserGroup);

    // Verify user is member of the group
    const membership = await userGroupRepository.findOne({
      where: {
        user_id: user.user_id,
        group_id: group_id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 },
      );
    }

    // Create GRC key record
    const grcKey = grcKeyRepository.create({
      name,
      description,
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

    console.log(`Created GRC key with ID: ${grcKey.id}`);

    // Generate encoded key
    const keyData: ApiKeyData = {
      uid: user.user_id,
      host: governance_url,
      otel: otel_endpoint || "",
      gid: group_id.toString(),
    };

    const encodedKey = encode(keyData);

    return NextResponse.json(
      {
        message: "GRC key created successfully",
        key: {
          id: grcKey.id,
          name: grcKey.name,
          description: grcKey.description,
          group_id: grcKey.group_id,
          governance_url: grcKey.governance_url,
          otel_endpoint: grcKey.otel_endpoint,
          created_at: grcKey.created_at,
          encoded_key: encodedKey,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create GRC key:", error);

    return NextResponse.json(
      {
        error: "Failed to create GRC key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
