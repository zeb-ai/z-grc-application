import { type NextRequest, NextResponse } from "next/server";
import { maskServiceKey, validateServiceKey } from "./service-auth";

/**
 * Middleware wrapper for service-authenticated endpoints
 * Validates X-Service-Key header before allowing access
 */
export function withServiceAuth<T extends Record<string, unknown>>(
  handler: (
    request: NextRequest,
    context?: { params?: T },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context?: { params?: T },
  ): Promise<NextResponse> => {
    // Extract service key from header
    const serviceKey = request.headers.get("X-Service-Key");

    // Validate service key
    if (!validateServiceKey(serviceKey)) {
      console.warn(
        `Invalid service key attempt: ${maskServiceKey(serviceKey || "")}`,
      );
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid or missing service API key",
        },
        { status: 401 },
      );
    }

    // Log successful authentication (masked key)
    console.log(
      `Service authenticated: ${maskServiceKey(serviceKey || "")} - ${request.method} ${request.url}`,
    );

    // Call the actual handler
    return handler(request, context);
  };
}