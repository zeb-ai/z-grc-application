import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Group } from "@/database/entities/Group.entity";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

const CreateGroupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  default_cost_limit: z
    .number()
    .min(0, "Default cost limit must be non-negative"),
});

// GET /api/groups - List all groups
export const GET = withAuthRequired<any>(async (request: NextRequest) => {
  try {
    const user = getCurrentUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const myGroups = searchParams.get("my_groups") === "true";

    const dataSource = await initializeDatabase();
    const groupRepository = dataSource.getRepository(Group);
    const userRepository = dataSource.getRepository("User");
    const userGroupRepository = dataSource.getRepository("UserGroup");

    let groups;

    // If my_groups is requested, only return groups user belongs to
    if (myGroups && user) {
      const userGroups = await userGroupRepository.find({
        where: { user_id: user.user_id },
      });
      const groupIds = userGroups.map((ug: any) => ug.group_id);

      if (groupIds.length === 0) {
        return NextResponse.json({ groups: [], total: 0 });
      }

      const allGroups = await groupRepository.find({
        order: { created_at: "DESC" },
      });
      groups = allGroups.filter((g) => groupIds.includes(g.group_id));
    } else {
      // Fetch all groups
      groups = await groupRepository.find({
        order: { created_at: "DESC" },
      });
    }

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      groups = groups.filter((group) =>
        group.name.toLowerCase().includes(searchLower),
      );
    }

    // Manually populate creator and member count for each group
    const groupsWithDetails = await Promise.all(
      groups.map(async (group) => {
        // Get creator
        const creator = await userRepository.findOne({
          where: { user_id: group.created_by },
        });

        // Get member count
        const memberCount = await userGroupRepository.count({
          where: { group_id: group.group_id },
        });

        return {
          ...group,
          memberCount,
          creator: creator
            ? {
                user_id: creator.user_id,
                name: creator.name,
                email: creator.email,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      groups: groupsWithDetails,
      total: groupsWithDetails.length,
    });
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch groups",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

// POST /api/groups - Create new group
export const POST = withAuthRequired<any>(async (request: NextRequest) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = CreateGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: z.treeifyError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { name, default_cost_limit } = validationResult.data;

    const dataSource = await initializeDatabase();
    const groupRepository = dataSource.getRepository(Group);
    const userGroupRepository = dataSource.getRepository("UserGroup");
    const quotaRepository = dataSource.getRepository("Quota");

    // Check if group name already exists for this user
    const existingGroup = await groupRepository.findOne({
      where: {
        name,
        created_by: user.user_id,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "Group with this name already exists" },
        { status: 409 },
      );
    }

    // Create new group
    const groupId = Date.now();
    const group = groupRepository.create({
      name,
      default_cost_limit,
      created_by: user.user_id,
      group_id: groupId,
    });

    await groupRepository.save(group);

    // Automatically add creator as admin member
    const userGroup = userGroupRepository.create({
      user_id: user.user_id,
      group_id: groupId,
      role: "admin",
      id: Date.now() + 1, // Ensure unique ID
    });

    await userGroupRepository.save(userGroup);

    // Create quota for creator
    const quota = quotaRepository.create({
      id: Date.now() + 2,
      user_id: user.user_id,
      group_id: groupId,
      total_cost: default_cost_limit,
      used_cost: 0,
    });

    await quotaRepository.save(quota);

    return NextResponse.json(
      {
        message: "Group created successfully",
        group: {
          ...group,
          creator: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
          },
          memberCount: 1, // Creator is now a member
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create group:", error);
    return NextResponse.json(
      {
        error: "Failed to create group",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
