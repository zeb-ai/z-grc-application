export enum DatabaseType {
  POSTGRES = "postgres",
  MYSQL = "mysql",
  SQLITE = "sqlite",
  MSSQL = "mssql",
  MONGODB = "mongodb",
}

export interface DatabaseConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
  ssl?: boolean;
  sqlitePath?: string;
  mongoUri?: string;
}

export const DEFAULT_PORTS: Record<DatabaseType, number> = {
  [DatabaseType.POSTGRES]: 5432,
  [DatabaseType.MYSQL]: 3306,
  [DatabaseType.MSSQL]: 1433,
  [DatabaseType.MONGODB]: 27017,
  [DatabaseType.SQLITE]: 0, // Not applicable for SQLite
};
