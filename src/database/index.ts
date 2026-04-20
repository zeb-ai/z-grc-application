import type { DataSource } from "typeorm";
import type { DatabaseConfig } from "./config/database.config";
import { DataSourceFactory } from "./config/datasource.factory";

export class DatabaseManager {
  private static instance: DatabaseManager;
  private dataSource: DataSource | null = null;
  private isConnecting: boolean = false;

  private constructor() {}

  // singleton database manager
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(config: DatabaseConfig): Promise<DataSource> {
    // Prevent multiple simultaneous initialization attempts
    if (this.isConnecting) {
      throw new Error("Database initialization already in progress");
    }

    // If already connected, close existing connection
    if (this.dataSource?.isInitialized) {
      console.log("Closing existing database connection...");
      await this.dataSource.destroy();
      this.dataSource = null;
    }

    try {
      this.isConnecting = true;
      console.log(`Initializing database connection: ${config.type}`);

      this.dataSource = DataSourceFactory.create(config);
      await this.dataSource.initialize();
      console.log(`Database connected successfully: ${config.type}`);
      return this.dataSource;
    } catch (error) {
      this.dataSource = null;
      console.error("Database connection failed:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  getDataSource(): DataSource {
    if (!this.dataSource?.isInitialized) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.dataSource;
  }

  isConnected(): boolean {
    return this.dataSource?.isInitialized ?? false;
  }

  async close(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
      console.log("Database connection closed");
    }
  }

  getRepository<T>(entity: new () => T) {
    return this.getDataSource().getRepository(entity);
  }
}

export * from "./config/database.config";
export { DataSourceFactory } from "./config/datasource.factory";
export * from "./entities";
