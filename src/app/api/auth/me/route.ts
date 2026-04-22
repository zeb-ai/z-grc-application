import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withAuthRequired } from "@/lib/auth-middleware";

export const GET = withAuthRequired<any>(async (_request: NextRequest, _context) => {
  const user = getCurrentUser();

  return NextResponse.json({
    user,
  });
});
