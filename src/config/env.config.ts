import { z } from "zod";
import {
  type DatabaseConfig,
  DatabaseType,
  DEFAULT_PORTS,
} from "@/database/config/database.config";

// Base schema for common fields
const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DB_NAME: z.string().default("governance"),
  DB_SYNCHRONIZE: z
    .preprocess((val) => val === "true", z.boolean())
    .default(false),
  DB_LOGGING: z.preprocess((val) => val === "true", z.boolean()).default(false),
});

// SQLite specific schema
const sqliteEnvSchema = baseEnvSchema.extend({
  DB_TYPE: z.literal(DatabaseType.SQLITE),
  DB_SQLITE_PATH: z.string().default("./data/governance.db"),
});

// MongoDB specific schema
const mongoEnvSchema = baseEnvSchema.extend({
  DB_TYPE: z.literal(DatabaseType.MONGODB),
  MONGODB_URI: z.string().optional(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.preprocess((val) => {
    if (!val || typeof val !== "string") return undefined;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().optional()),
});

// SQL databases (Postgres, MySQL, MSSQL) schema
const sqlEnvSchema = baseEnvSchema.extend({
  DB_TYPE: z.enum([
    DatabaseType.POSTGRES,
    DatabaseType.MYSQL,
    DatabaseType.MSSQL,
  ]),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.preprocess((val) => {
    if (!val || typeof val !== "string") return undefined;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().optional()),
  DB_USERNAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_SSL: z.preprocess((val) => val === "true", z.boolean()).default(false),
});

// Discriminated union of all database types
const envSchema = z.discriminatedUnion("DB_TYPE", [
  sqliteEnvSchema,
  mongoEnvSchema,
  sqlEnvSchema,
]);

// Parse environment variables once
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      for (const issue of error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
      throw new Error("Invalid environment configuration");
    }
    throw error;
  }
};

const env = parseEnv();

export function getDatabaseConfig(): DatabaseConfig {
  const config: DatabaseConfig = {
    type: env.DB_TYPE,
    database: env.DB_NAME,
    synchronize: env.DB_SYNCHRONIZE,
    logging: env.DB_LOGGING,
  };

  if (env.DB_TYPE === DatabaseType.SQLITE) {
    config.sqlitePath = env.DB_SQLITE_PATH;
  } else if (env.DB_TYPE === DatabaseType.MONGODB) {
    if (env.MONGODB_URI) {
      config.mongoUri = env.MONGODB_URI;
    }
    config.host = env.DB_HOST;
    config.port = env.DB_PORT;
  } else {
    config.host = env.DB_HOST;
    config.port = env.DB_PORT || DEFAULT_PORTS[env.DB_TYPE];
    config.username = env.DB_USERNAME;
    config.password = env.DB_PASSWORD;
    config.ssl = env.DB_SSL;
  }

  return config;
}

const clickhouseSchema = z.object({
  CLICKHOUSE_HOST: z.string().optional(),
  CLICKHOUSE_USER: z.string().optional(),
  CLICKHOUSE_PASSWORD: z.string().optional(),
  CLICKHOUSE_DATABASE: z.string().default("default"),
});

export const clickhouseConfig = clickhouseSchema.parse(process.env);

// Auth configuration
const authSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("dev-secret-key-change-in-production-min-32-characters"),
});

export const authConfig = authSchema.parse(process.env);
