import { getDatabaseConfig } from "@/config/env.config";
import { DatabaseManager } from "@/database";

export async function initializeDatabase() {
  const dbManager = DatabaseManager.getInstance();

  if (dbManager.isConnected()) {
    return dbManager.getDataSource();
  }

  try {
    const config = getDatabaseConfig();
    return await dbManager.initialize(config);
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

export function getDatabase() {
  return DatabaseManager.getInstance();
}

export function requireDatabase() {
  const dbManager = DatabaseManager.getInstance();
  if (!dbManager.isConnected()) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first.",
    );
  }
  return dbManager;
}
