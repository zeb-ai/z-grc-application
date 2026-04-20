import { type NextRequest, NextResponse } from "next/server";
import { User } from "@/database/entities/User.entity";
import { withAuthRequired } from "@/lib/auth-middleware";
import { initializeDatabase } from "@/lib/db";

// GET /api/users/search?q=email - Search users by email
export const GET = withAuthRequired<any>(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    // Search users by email (case-insensitive)
    const users = await userRepository.find({
      where: {
        email: { $regex: query, $options: "i" } as any,
      },
      take: 10,
    });

    return NextResponse.json({
      users: users.map((user) => ({
        user_id: user.user_id,
        email: user.email,
        name: user.name,
      })),
    });
  } catch (error) {
    console.error("Failed to search users:", error);
    return NextResponse.json(
      {
        error: "Failed to search users",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
