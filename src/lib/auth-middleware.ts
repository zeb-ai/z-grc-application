import { type NextRequest, NextResponse } from "next/server";
import { authContext, verifyToken } from "@/lib/auth";

type RouteContext<P = any> = {
  params: Promise<P>;
};

export function withAuth<T = any, P = any>(
  handler: (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse<any>>,
): (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse<any>> {
  return async (request: NextRequest, context: RouteContext<P>) => {
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

export function withAuthRequired<T = any, P = any>(
  handler: (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse<any>>,
): (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse<any>> {
  return withAuth<T, P>(async (request: NextRequest, context: RouteContext<P>) => {
    const user = authContext.getStore();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 },
      );
    }

    return handler(request, context);
  });
}
