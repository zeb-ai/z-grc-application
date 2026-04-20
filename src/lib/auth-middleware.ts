import { type NextRequest, NextResponse } from "next/server";
import { authContext, verifyToken } from "@/lib/auth";

export function withAuth<T>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
): (request: NextRequest, context?: any) => Promise<NextResponse<T>> {
  return async (request: NextRequest, context?: any) => {
    // Extract token from cookie
    const token = request.cookies.get("auth_token")?.value;

    let user = null;
    if (token) {
      user = verifyToken(token);
    }

    // Run the handler within the authContext
    return authContext.run(user, () => handler(request, context));
  };
}

export function withAuthRequired<T>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>,
): (request: NextRequest, context?: any) => Promise<NextResponse<T>> {
  return withAuth(async (request: NextRequest, context?: any) => {
    const user = authContext.getStore();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 },
      ) as NextResponse<T>;
    }

    return handler(request, context);
  });
}
