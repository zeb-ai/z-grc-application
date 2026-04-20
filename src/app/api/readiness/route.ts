import { NextResponse } from "next/server";
import { clickhouseClient } from "@/clickhouse/client";
import { initializeDatabase } from "@/lib/db";

export async function GET() {
  try {
    const [dataSource, clickhouseReady] = await Promise.all([
      initializeDatabase(),
      clickhouseClient.ping(),
    ]);

    // App is ready if database is connected, ClickHouse is optional
    const isReady = dataSource.isInitialized;

    return NextResponse.json(
      {
        status: isReady ? "ready" : "not_ready",
        database: {
          connected: dataSource.isInitialized,
          type: dataSource.options.type,
        },
        clickhouse: {
          connected: clickhouseReady,
        },
      },
      { status: isReady ? 200 : 503 },
    );
  } catch (error) {
    console.error("Readiness check failed:", error);
    return NextResponse.json(
      {
        status: "not_ready",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
