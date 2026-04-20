import {
  type ClickHouseClient as CHClient,
  createClient,
} from "@clickhouse/client";
import { clickhouseConfig } from "@/config/env.config";

export class ClickHouseClient {
  private static instance: ClickHouseClient;
  private client: CHClient | null = null;
  private readonly isEnabled: boolean;

  private constructor() {
    // Only enable if CLICKHOUSE_HOST is configured and not pointing to localhost
    this.isEnabled = !!clickhouseConfig.CLICKHOUSE_HOST;
  }

  static getInstance(): ClickHouseClient {
    if (!ClickHouseClient.instance) {
      ClickHouseClient.instance = new ClickHouseClient();
    }
    return ClickHouseClient.instance;
  }

  private getClient(): CHClient {
    if (!this.client) {
      this.client = createClient({
        url: clickhouseConfig.CLICKHOUSE_HOST!,
        username: clickhouseConfig.CLICKHOUSE_USER,
        password: clickhouseConfig.CLICKHOUSE_PASSWORD,
        database: clickhouseConfig.CLICKHOUSE_DATABASE,
      });
    }
    return this.client;
  }

  async query<T = any>(
    query: string,
    params?: Record<string, any>,
  ): Promise<T[]> {
    if (!this.isEnabled) {
      throw new Error(
        "ClickHouse is not enabled. Configure CLICKHOUSE_HOST to a non-localhost URL.",
      );
    }

    const resultSet = await this.getClient().query({
      query,
      format: "JSONEachRow",
      query_params: params,
    });

    return await resultSet.json<T>();
  }

  async ping(): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      await this.getClient().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async exec(query: string): Promise<void> {
    if (!this.isEnabled) {
      throw new Error(
        "ClickHouse is not enabled. Configure CLICKHOUSE_HOST to a non-localhost URL.",
      );
    }
    await this.getClient().exec({ query });
  }
}

export const clickhouseClient = ClickHouseClient.getInstance();
