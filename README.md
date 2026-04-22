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

## 🚀 Development

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- PostgreSQL or your preferred database
- ClickHouse (for telemetry data)

### Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd governance-ui
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
   
   JWT_SECRET=your-super-secret-jwt-key-change-this
   SERVICE_API_KEYS=sk_your_service_key_here
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

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Lint code with Biome
- `bun format` - Format code with Biome

---

## 🐳 Self-Host

Deploy the complete stack with Docker Compose in minutes.

### Prerequisites

- Docker & Docker Compose
- 2GB+ RAM recommended

### Quick Deploy

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd governance-ui
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
   docker compose up -d
   ```

4. **Access application**
   - **UI**: [http://localhost:3000](http://localhost:3000)
   - **ClickHouse**: [http://localhost:8123](http://localhost:8123)
   - **OTEL Collector**: http://localhost:4317 (gRPC), http://localhost:4318 (HTTP)

### Services Included

| Service | Port | Description |
|---------|------|-------------|
| governance-ui | 3000 | Main application |
| postgres | 5433 | PostgreSQL database |
| clickhouse | 8123, 9000 | ClickHouse telemetry store |
| otel-collector | 4317, 4318 | OpenTelemetry collector |

### Manage Services

```bash
# View logs
docker compose logs -f governance-ui

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Rebuild after code changes
docker compose up --build -d
```

### Generate API Keys

Generate secure service API keys for external applications:

```bash
# Using Node.js
node -e "console.log('sk_' + require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32 | awk '{print "sk_" $1}'
```

---

## Database Support

The platform supports multiple databases out of the box:

- **PostgreSQL** (recommended)
- **MySQL**
- **MongoDB**
- **SQLite** (development only)
- **MSSQL**

Configure via `DB_TYPE` in your `.env` file. See [`.env.example`](.env.example) for connection string formats.

---

## Tech Stack

- **Framework**: Next.js 16.2 (React 19)
- **Language**: TypeScript
- **Database**: TypeORM with multi-DB support
- **Analytics**: ClickHouse
- **Telemetry**: OpenTelemetry
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Charts**: Recharts, Chart.js
- **Runtime**: Bun

---

## License

[MIT](LICENSE) © 2026 zeb labs