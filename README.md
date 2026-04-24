# Governance Engine UI

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)

A modern governance and compliance monitoring platform with role-based access control, API key management, telemetry tracking, and comprehensive logging capabilities.

## Features

- **API Key Management** - Generate, manage, and revoke API keys with quota controls
- **User Groups & RBAC** - Fine-grained permissions and group-based access control
- **Telemetry & Monitoring** - Real-time traces, metrics, and distributed logging with OpenTelemetry
- **Multi-Database Support** - PostgreSQL, MySQL, MongoDB, SQLite, MSSQL
- **Analytics Dashboard** - Cost trends, system health, and activity monitoring
- **Self-Hostable** - Complete Docker setup with minimal configuration

---

## Architecture

The **Governance Engine UI** is a centralized control plane for AI governance, monitoring, and compliance. This application focuses exclusively on visualization, policy management, and telemetry aggregation.

### How It Works

This UI is the **control center**, not the enforcement layer. It generates API keys that contain embedded configuration (governance URLs, quotas, policies, telemetry endpoints). Applications use these keys via the **Z-GRC Package** to enforce policies at runtime.

**Key Principles:**
- **Stateless Client Package**: Z-GRC has no hardcoded configuration – everything comes from the API key
- **Centralized Control**: All policies, permissions, and quotas managed through this UI
- **Real-Time Telemetry**: Usage data flows back for monitoring and compliance
- **Zero Configuration**: Generate a key, pass it to Z-GRC, enforcement is automatic

### Integration with Z-GRC Package

This UI works in tandem with the **Z-GRC Package** (Zeb Governance, Risk and Compliance), which wraps AI SDK calls with governance policies, quota enforcement and observability.

For package installation, usage examples, and technical documentation, visit the Z-GRC repository:

**🔗 [Z-GRC Package Repository](https://github.com/zeb-ai/z-grc)**

### Use Cases

**Enterprise AI Gateway**  
Deploy as a proxy layer for organizational AI usage, controlling access to models and maintaining audit trails.

**Multi-Tenant Applications**  
Isolate resources per customer with group-based quotas and independent usage tracking.

**Development Team Management**  
Issue individual API keys with granular permissions and monitor usage patterns across teams.

**Compliance & Auditing**  
Maintain comprehensive logs of AI interactions with user attribution and cost data for regulatory compliance.

**Cost Control**  
Set budget limits, analyze spending patterns, and prevent runaway costs through real-time enforcement.

---

## Development

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- PostgreSQL or your preferred database
- ClickHouse (for telemetry data)

### Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/zeb-ai/z-grc-application.git
   cd z-grc-application
   bun install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your database credentials and JWT secret:
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=governance_engine
   
   CLICKHOUSE_HOST=http://localhost:8123
   CLICKHOUSE_USER=default
   
   JWT_SECRET=your-super-secret-jwt-key-change-this #Changeme
   SERVICE_API_KEYS=sk_your_service_key_here #Changeme
   ```

3. **Start databases** (optional - if you need local instances)
   ```bash
   docker compose up postgres clickhouse -d
   ```

4. **Run development server**
   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

---

## Self-Host

Deploy the complete stack with Docker Compose in minutes.

### Quick Deploy

1. **Clone repository**
   ```bash
   git clone https://github.com/zeb-ai/z-grc-application.git
   cd z-grc-application
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.docker
   ```
   
   Update `.env.docker` with production values:
   ```env
   # Database
   DB_TYPE=postgres
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=governance
   DB_PASSWORD=CHANGE_THIS_PASSWORD
   DB_NAME=governance_engine
   DB_SYNCHRONIZE=false  # Important: false in production
   
   # ClickHouse
   CLICKHOUSE_HOST=http://clickhouse:8123
   CLICKHOUSE_USER=default
   
   # Auth
   JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECRET
   SERVICE_API_KEYS=sk_YOUR_GENERATED_KEY
   ```

3. **Start all services**
   ```bash
   docker compose up -d #detached mode
   ```

4. **Access application**
   - **Application**: [http://localhost:3000](http://localhost:3000)
   - **ClickHouse**: [http://localhost:8123](http://localhost:8123)
   - **OTEL Collector**: http://localhost:4317 (gRPC), http://localhost:4318 (HTTP)

### Services Included

| Service                | Port | Description |
|------------------------|------|-------------|
| governance-Application | 3000 | Main application |
| postgres               | 5433 | PostgreSQL database |
| clickhouse             | 8123, 9000 | ClickHouse telemetry store |
| otel-collector         | 4317, 4318 | OpenTelemetry collector |


### Generate API Keys

Generate secure service API keys for external applications:
> Using for JWT secret and Service Kit

```bash
# Using Node.js
node -e "console.log('sk_' + require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL for Service Kit, To be shared with Third party application to use Governance Application apis
openssl rand -hex 32 | awk '{print "sk_" $1}'

# Using OpenSSL for JWT
openssl rand -hex 32
```

---

## Database Support

The platform supports multiple databases out of the box:

- **PostgreSQL** (recommended)
- **MySQL**
- **MongoDB**
- **SQLite**
- **MSSQL**

Configure via `DB_TYPE` in your `.env` file. See [`.env.example`](.env.example) for connection string formats.
