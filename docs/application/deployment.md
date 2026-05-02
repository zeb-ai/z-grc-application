# Deployment

## Docker Deployment

### Production Setup

```bash
git clone https://github.com/zeb-ai/z-grc-application.git
cd z-grc-application
cp .env.example .env.docker
```

Edit `.env.docker`:

```env
NODE_ENV=production
DB_SYNCHRONIZE=false
JWT_SECRET=<64-char-secret>
SERVICE_API_KEYS=sk_<generated-key>
```

Deploy:

```bash
docker compose up -d
```

## Managed Databases

Use cloud-managed PostgreSQL and ClickHouse for production.

```env
DB_HOST=your-db.region.rds.amazonaws.com
CLICKHOUSE_HOST=https://your-clickhouse.cloud
```

## Next Steps

- [Deploy Application](../getting-started/quickstart-application.md)
- [Install Package](https://zeb-ai.github.io/z-grc/how-to-use/#1-for-aws-bedrock-model-calls){:target="_blank"}
- [Proxy Server](https://zeb-ai.github.io/z-grc/how-to-use/#2-for-claude-code){:target="_blank"}
