import path from "node:path";
import { DataSource, type DataSourceOptions } from "typeorm";
import { type DatabaseConfig, DatabaseType, DEFAULT_PORTS } from "@/database";
import { GrcKey } from "../entities/GrcKey.entity";
import { Group } from "../entities/Group.entity";
import { PendingInvitation } from "../entities/PendingInvitation.entity";
import { Quota } from "../entities/Quota.entity";
import { User } from "../entities/User.entity";
import { UserGroup } from "../entities/UserGroup.entity";

export class DataSourceFactory {
  static create(config: DatabaseConfig): DataSource {
    const migrationsPath = path.join(
      __dirname,
      `../migrations/${config.type}/*{.ts,.js}`,
    );

    const baseOptions: Partial<DataSourceOptions> = {
      entities: [User, Group, Quota, UserGroup, PendingInvitation, GrcKey],
      migrations: [migrationsPath],
      synchronize: config.synchronize ?? false,
      logging: config.logging ?? false,
    };

    let dataSourceOptions: DataSourceOptions;

    switch (config.type) {
      case DatabaseType.POSTGRES:
        dataSourceOptions = {
          ...baseOptions,
          type: "postgres",
          host: config.host || "localhost",
          port: config.port || DEFAULT_PORTS[DatabaseType.POSTGRES],
          username: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl ? { rejectUnauthorized: false } : false,
        } as DataSourceOptions;
        break;

      case DatabaseType.MYSQL:
        dataSourceOptions = {
          ...baseOptions,
          type: "mysql",
          host: config.host || "localhost",
          port: config.port || DEFAULT_PORTS[DatabaseType.MYSQL],
          username: config.username,
          password: config.password,
          database: config.database,
        } as DataSourceOptions;
        break;

      case DatabaseType.SQLITE:
        dataSourceOptions = {
          ...baseOptions,
          type: "sqlite",
          database: config.sqlitePath || config.database || ":memory:",
        } as DataSourceOptions;
        break;

      case DatabaseType.MSSQL:
        dataSourceOptions = {
          ...baseOptions,
          type: "mssql",
          host: config.host || "localhost",
          port: config.port || DEFAULT_PORTS[DatabaseType.MSSQL],
          username: config.username,
          password: config.password,
          database: config.database,
          options: {
            encrypt: config.ssl ?? true,
            trustServerCertificate: true,
          },
        } as DataSourceOptions;
        break;

      case DatabaseType.MONGODB:
        if (config.mongoUri) {
          dataSourceOptions = {
            ...baseOptions,
            type: "mongodb",
            url: config.mongoUri,
            useUnifiedTopology: true,
          } as unknown as DataSourceOptions;
        } else {
          dataSourceOptions = {
            ...baseOptions,
            type: "mongodb",
            host: config.host || "localhost",
            port: config.port || DEFAULT_PORTS[DatabaseType.MONGODB],
            username: config.username,
            password: config.password,
            database: config.database,
            useUnifiedTopology: true,
          } as unknown as DataSourceOptions;
        }
        break;

      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }

    return new DataSource(dataSourceOptions);
  }
}
