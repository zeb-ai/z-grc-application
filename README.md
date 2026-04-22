# Governance Engine UI

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**A production-ready governance and cost control platform for AI/ML applications with comprehensive OpenTelemetry observability.**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Overview

Governance Engine UI is a sophisticated web application designed for AI/ML governance, cost management, and observability. It provides a unified platform for managing API keys, tracking costs, monitoring telemetry data, and enforcing governance policies across distributed AI services.

### Key Capabilities

- **Cost Control System**: Real-time tracking and quota management for AI/ML API consumption
- **Multi-Database Support**: PostgreSQL, MySQL, SQLite, MSSQL, and MongoDB
- **OpenTelemetry Integration**: Full observability with metrics, traces, and logs from ClickHouse
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for users, groups, and resources
- **GRC Key Management**: Governance, Risk, and Compliance key generation and lifecycle management
- **Self-Hosting Ready**: Complete Docker Compose setup with production-grade configuration

---

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (RBAC) with granular permissions
- User groups with admin and member roles
- Service API keys for external application integration
- Invitation system for user onboarding

### 💰 Cost Management
- Real-time cost tracking per user and group
- Configurable quota limits with cost-based controls
- Decimal precision for accurate cost calculations
- Usage analytics and reporting
- Cost attribution across services and endpoints

### 🔑 API Key Governance
- GRC (Governance, Risk, Compliance) key generation
- UUID v7-based key identifiers
- Key lifecycle management (create, revoke, rotate)
- Per-key quota and cost tracking
- Key-to-group association for policy enforcement

### 📊 Observability & Monitoring
- **Metrics**: Real-time metrics visualization from ClickHouse
  - Service-level metrics (latency, throughput, error rates)
  - Histogram data points for distribution analysis
  - Custom metric filtering and aggregation
  
- **Distributed Tracing**: Full trace visualization with span details
  - Service topology mapping
  - Request flow analysis with span events and links
  - Performance bottleneck identification
  
- **Log Management**: Centralized log aggregation and search
  - Structured log parsing
  - Severity-based filtering
  - Time-range queries with full-text search

### 👥 User & Group Management
- Hierarchical group structure
- User-to-group associations with role assignment
- Quota management at group level
- Member invitation workflow
- Pending invitation tracking

### 🏗️ Database Flexibility
Supports multiple database backends via TypeORM:
- **PostgreSQL** (recommended for production)
- **MySQL/MariaDB**
- **SQLite** (great for development)
- **Microsoft SQL Server**
- **MongoDB** (NoSQL option)

### 🎨 Modern UI/UX
- Built with **shadcn/ui** components
- Dark/light theme support via `next-themes`
- Responsive design with Tailwind CSS 4
- Smooth animations with Framer Motion
- Command palette (cmdk) for power users
- Toast notifications for user feedback

---

## Quick Start

### Prerequisites

- **Node.js** 20+ or **Bun** 1.0+
- **Docker** and **Docker Compose** (for containerized setup)
- **PostgreSQL** 16+ (or your preferred database)
- **ClickHouse** 25.3+ (for telemetry data)

### Option 1: Docker Compose (Recommended)

The fastest way to get started with all dependencies:

```bash
# Clone the repository
git clone <repository-url>
cd governance-ui

# Copy and configure environment variables
cp .env.example .env.docker
# Edit .env.docker with your configuration

# Start all services (UI, PostgreSQL, ClickHouse, OpenTelemetry Collector)
docker-compose up -d

# View logs
docker-compose logs -f governance-ui

# Access the application
open http://localhost:3000
```

The Docker Compose setup includes:
- **Governance UI** on port 3000
- **PostgreSQL** on port 5432
- **ClickHouse** on ports 8123 (HTTP) and 9000 (native)
- **OpenTelemetry Collector** on ports 4317 (gRPC) and 4318 (HTTP)

### Option 2: Local Development

```bash
# Install dependencies
npm install
# or
bun install

# Copy environment configuration
cp .env.example .env.local

# Configure your database and ClickHouse connection in .env.local
# See "Configuration" section below

# Run database migrations (auto-sync enabled in development)
npm run dev

# Start development server
npm run dev
# or
bun dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Or build Docker image
docker build -t governance-ui:latest .
docker run -p 3000:3000 --env-file .env.docker governance-ui:latest
```

---

## Configuration

### Environment Variables

Create a `.env.local` file (or `.env.docker` for Docker) based on `.env.example`:

#### Database Configuration

```bash
# Database Type: postgres | mysql | sqlite | mssql | mongodb
DB_TYPE=postgres

# PostgreSQL (recommended)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=governance_engine
DB_SSL=false

# Auto-sync schema (NEVER use in production!)
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

#### ClickHouse Configuration

```bash
CLICKHOUSE_HOST=http://localhost:8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default
```

#### Authentication

```bash
# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Generate a secure secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Service API Keys

```bash
# Comma-separated service API keys for external applications
# Generate keys:
# node -e "console.log('sk_' + require('crypto').randomBytes(32).toString('hex'))"

SERVICE_API_KEYS=sk_your_service_key_here,sk_another_key_here
```

#### Optional Configuration

```bash
# Base URL (auto-detected if not set)
GOVERNANCE_URL=https://governance.example.com

# OpenTelemetry endpoint
OTEL_ENDPOINT=https://otel.example.com
```

---

## Architecture

### Technology Stack

#### Frontend
- **Next.js 16.2** - React framework with App Router
- **React 19.2** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Framer Motion** - Animation library
- **Recharts** - Data visualization

#### Backend
- **Next.js API Routes** - Serverless API endpoints
- **TypeORM 0.3** - ORM with multi-database support
- **ClickHouse Client** - High-performance telemetry queries
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **Zod 4** - Runtime validation

#### Database Layer
- **PostgreSQL** - Primary relational database
- **ClickHouse** - OLAP database for telemetry data
- **TypeORM Migrations** - Schema version control

#### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Bun** - Fast JavaScript runtime (optional)
- **Biome** - Fast linter and formatter

### Project Structure

```
governance-ui/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── home/            # Dashboard home
│   │   │   ├── user-groups/     # Group management
│   │   │   ├── api-keys/        # GRC key management
│   │   │   ├── policies/        # Policy configuration
│   │   │   ├── monitoring/      # Telemetry visualization
│   │   │   │   ├── metrics/     # Metrics explorer
│   │   │   │   ├── traces/      # Distributed tracing
│   │   │   │   └── logs/        # Log viewer
│   │   │   └── layout.tsx       # Dashboard layout with auth
│   │   └── api/                 # API routes
│   │       ├── auth/            # Authentication endpoints
│   │       ├── users/           # User management
│   │       ├── groups/          # Group CRUD operations
│   │       ├── apikey/          # GRC key generation
│   │       ├── quota/           # Quota management
│   │       ├── metrics/         # Metrics API
│   │       ├── telemetry/       # Traces API
│   │       ├── logs/            # Logs API
│   │       └── external/        # External service integration
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   └── monitoring/          # Telemetry visualization components
│   ├── database/                # Database layer
│   │   ├── entities/            # TypeORM entities
│   │   │   ├── User.entity.ts
│   │   │   ├── Group.entity.ts
│   │   │   ├── UserGroup.entity.ts
│   │   │   ├── GrcKey.entity.ts
│   │   │   ├── Quota.entity.ts
│   │   │   └── PendingInvitation.entity.ts
│   │   ├── config/              # Database configuration
│   │   └── index.ts             # Database connection
│   ├── clickhouse/              # ClickHouse client
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts              # JWT utilities
│   │   ├── rbac.ts              # RBAC implementation
│   │   └── utils.ts             # Common utilities
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts              # Auth types
│   │   ├── group.ts             # Group types
│   │   ├── rbac.ts              # RBAC types
│   │   └── telemetry.ts         # Telemetry types
│   ├── hooks/                   # React hooks
│   └── config/                  # Application configuration
├── public/                      # Static assets
├── docker-compose.yaml          # Multi-service orchestration
├── Dockerfile                   # Production container image
├── .env.example                 # Environment template
├── .env.docker                  # Docker-specific environment
├── otel-config.yaml            # OpenTelemetry Collector config
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

### Data Model

#### Core Entities

**User**
- Unique user identification
- Email and password (hashed with bcryptjs)
- Super admin flag for elevated permissions
- Creation timestamp

**Group**
- Organizational units for resource grouping
- Quota limits for cost control
- Member count tracking

**UserGroup**
- Many-to-many relationship between users and groups
- Role assignment (admin | member)
- Join date tracking

**GrcKey**
- Governance, Risk, Compliance keys
- UUID v7 identifiers for chronological sorting
- Associated with user (creator) and group
- Embedded governance URL and OTEL endpoint

**Quota**
- Cost tracking per user-group combination
- Total allocated cost
- Used cost with decimal precision (10,6)
- Real-time usage monitoring

**PendingInvitation**
- User invitation workflow
- Token-based invitation system
- Expiration tracking

### API Architecture

#### RESTful Endpoints

**Authentication**
- `POST /api/auth/login` - User login with JWT generation
- `POST /api/auth/logout` - Session termination
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user profile

**Users**
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

**Groups**
- `GET /api/groups` - List user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `PUT /api/groups/:id/quota` - Update quota

**GRC Keys**
- `GET /api/apikey` - List user's keys
- `POST /api/apikey/generate` - Generate new GRC key
- `DELETE /api/apikey/:id` - Revoke key

**Quota Management**
- `GET /api/quota/user/:userId` - Get user's quota across groups
- `GET /api/quota/group/:groupId` - Get group quota details
- `PUT /api/quota/:id` - Update quota allocation

**Telemetry**
- `GET /api/metrics/list` - List available metrics
- `GET /api/metrics/data` - Query metric data points
- `GET /api/metrics/stats` - Metric statistics
- `GET /api/telemetry/traces` - Query distributed traces
- `GET /api/telemetry/traces/:id` - Get trace details
- `GET /api/logs` - Query logs with filtering

**External Integration**
- `POST /api/external/generate-key` - Service API key authentication

### Security

#### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Server validates against database (bcrypt comparison)
3. JWT token generated with user ID and role
4. Token returned to client (stored in httpOnly cookie)
5. Subsequent requests include token in Authorization header
6. Middleware validates token and extracts user context

#### Authorization Model

**Super Admin**
- Full system access (permission: `*`)
- User management capabilities
- System configuration access

**Group Admin**
- Full control within assigned groups
- Member management (add, remove, role assignment)
- Quota configuration
- GRC key generation and revocation
- Analytics and reporting access

**Group Member**
- View group details and members
- View own quota and usage
- Generate personal GRC keys
- Read-only analytics access

#### Permission System

Permissions are hierarchical and composable:

```typescript
// Group Permissions
groups.view, groups.edit, groups.delete
groups.settings.view, groups.settings.manage

// Member Permissions
members.view, members.view_details
members.add, members.remove, members.edit_role

// Quota Permissions
quota.view_own, quota.view_all, quota.manage

// Analytics Permissions
analytics.view, reports.view, reports.export
```

---

## OpenTelemetry Integration

### Overview

Governance Engine UI provides comprehensive observability through OpenTelemetry integration, storing telemetry data in ClickHouse for high-performance analytics.

### Components

1. **OpenTelemetry Collector**: Receives telemetry via OTLP protocol
2. **ClickHouse**: Stores metrics, traces, and logs in optimized tables
3. **Governance UI**: Visualizes telemetry data with rich filtering

### Configuration

The `otel-config.yaml` defines the collector pipeline:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  clickhouse:
    endpoint: tcp://clickhouse:9000
    database: default
    ttl: 72h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    metrics_table_name: otel_metrics

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

### Instrumenting Your Application

To send telemetry to Governance Engine:

```typescript
import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Initialize tracer
const provider = new NodeTracerProvider({
  resource: new Resource({
    'service.name': 'your-service-name',
  }),
});

const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces', // OTEL Collector endpoint
  headers: {
    'x-grc-key': 'your-grc-key-here', // GRC key for authentication
  },
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

// Use in your application
const tracer = trace.getTracer('your-service-name');
const span = tracer.startSpan('operation-name');
// ... your code
span.end();
```

### Metrics Visualization

The metrics dashboard provides:
- Time-series charts with customizable time ranges
- Service and metric name filtering
- Histogram distribution analysis
- Statistical summaries (min, max, avg, p50, p95, p99)
- Export capabilities for further analysis

### Distributed Tracing

The trace viewer offers:
- Service topology graph
- Waterfall view of span execution
- Span attributes and events inspection
- Error highlighting and stack traces
- Cross-service request flow analysis

### Log Management

The log viewer supports:
- Full-text search across log messages
- Severity filtering (DEBUG, INFO, WARN, ERROR, FATAL)
- Time-range queries with millisecond precision
- JSON log parsing and pretty-printing
- Log correlation with traces (via trace ID)

---

## Database Management

### Supported Databases

#### PostgreSQL (Recommended)
```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secure_password
DB_NAME=governance_engine
DB_SSL=false
```

**Why PostgreSQL?**
- ACID compliance for data integrity
- JSON support for flexible schemas
- Excellent performance with proper indexing
- Rich ecosystem and tooling
- Battle-tested in production environments

#### MySQL/MariaDB
```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=secure_password
DB_NAME=governance_engine
```

#### SQLite (Development)
```bash
DB_TYPE=sqlite
DB_SQLITE_PATH=./data/governance.db
```

Great for:
- Local development
- Testing
- Demos
- Single-user deployments

#### MongoDB
```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/governance_engine
# or
DB_HOST=localhost
DB_PORT=27017
DB_NAME=governance_engine
```

For NoSQL flexibility with TypeORM's MongoDB support.

#### Microsoft SQL Server
```bash
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=secure_password
DB_NAME=governance_engine
```

### Schema Management

#### Development
```bash
# Auto-sync enabled (creates/updates tables automatically)
DB_SYNCHRONIZE=true
DB_LOGGING=true
```

**⚠️ WARNING**: Never use `DB_SYNCHRONIZE=true` in production! It can cause data loss.

#### Production
```bash
# Disable auto-sync
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Use migrations (future enhancement)
npm run typeorm:migration:generate
npm run typeorm:migration:run
```

### Database Backup

#### PostgreSQL
```bash
# Backup
pg_dump -U postgres -d governance_engine > backup.sql

# Restore
psql -U postgres -d governance_engine < backup.sql
```

#### MySQL
```bash
# Backup
mysqldump -u root -p governance_engine > backup.sql

# Restore
mysql -u root -p governance_engine < backup.sql
```

#### SQLite
```bash
# Backup (simple file copy)
cp ./data/governance.db ./data/governance.backup.db
```

---

## Deployment

### Docker Deployment

#### Single Container
```bash
# Build image
docker build -t governance-ui:latest .

# Run container
docker run -d \
  --name governance-ui \
  -p 3000:3000 \
  --env-file .env.docker \
  governance-ui:latest
```

#### Docker Compose (Full Stack)
```bash
# Start all services
docker-compose up -d

# Scale UI instances
docker-compose up -d --scale governance-ui=3

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Checklist

- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Generate secure `SERVICE_API_KEYS` for integrating Third party application
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Enable `DB_SSL=true` for database connections

### Monitoring

Monitor these key metrics:
- HTTP request latency (p50, p95, p99)
- Database connection pool utilization
- ClickHouse query performance
- JWT token validation time
- API error rates
- Memory usage and GC pressure
- CPU utilization
- Disk I/O for ClickHouse

---

## Development

### Prerequisites
- Node.js 20+ or Bun 1.0+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

```bash
# Clone repository
git clone <repository-url>
cd governance-ui

# Install dependencies
bun install

# Copy environment template
cp .env.example .env.local

# Start development server
bun dev
```

### Code Quality Tools

#### Linting & Formatting
```bash
# Run Biome linter
bun run lint

# Format code
bun run format
```

#### Type Checking
```bash
# Check types
bunx tsc --noEmit
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following project conventions
   - Add types for new interfaces
   - Update relevant documentation

3. **Test Locally**
   ```bash
   bun dev
   # Test in browser
   ```

4. **Lint and Format**
   ```bash
   bun run lint
   bun run format
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Project Conventions

#### Code Style
- Use TypeScript for all new files
- Follow functional programming patterns
- Prefer React Server Components over Client Components
- Use `async/await` over promises
- Implement proper error handling

#### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Files: kebab-case (`user-profile.tsx`)
- Functions: camelCase (`getUserProfile`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Types/Interfaces: PascalCase (`UserProfile`)

#### Component Structure
```tsx
// 1. Imports
import { type FC } from 'react';
import { cn } from '@/lib/utils';

// 2. Types
interface Props {
  className?: string;
}

// 3. Component
export const Component: FC<Props> = ({ className }) => {
  // 4. Hooks
  // 5. Handlers
  // 6. Render
  return <div className={cn('base-class', className)} />;
};
```

#### API Route Structure
```typescript
// 1. Imports
import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// 2. GET handler
export async function GET(request: Request) {
  try {
    // Auth check
    const user = await verifyJWT(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Logic
    const data = await fetchData();

    // Response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection settings in .env
DB_HOST=localhost  # or 'postgres' in Docker network
DB_PORT=5432
```

#### ClickHouse Query Failures

**Problem**: `ClickHouseError: Table 'otel_traces' doesn't exist`

**Solution**:
```bash
# Ensure OTEL collector has created tables
docker-compose logs otel-collector

# Manually create tables if needed (connect to ClickHouse)
docker exec -it governance-clickhouse clickhouse-client

# Check tables
SHOW TABLES;
```

#### JWT Token Invalid

**Problem**: `Error: Invalid token` on every request

**Solution**:
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_SECRET=<generated-secret>

# Restart development server
```

#### Build Errors

**Problem**: `Module not found` or type errors during build

**Solution**:
```bash
# Clean cache
rm -rf .next node_modules
bun install
bun run build
```

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 bun dev
```

### Debug Mode

Enable detailed logging:

```bash
# .env.local
DB_LOGGING=true
NODE_ENV=development
DEBUG=*
```

### Getting Help

1. Check [GitHub Issues](https://github.com/your-org/governance-ui/issues)
2. Review Docker Compose logs: `docker-compose logs -f`
3. Check database logs
4. Verify environment variables
5. Create a minimal reproduction case

---

## API Documentation

### Authentication Required

Most endpoints require JWT authentication via Authorization header:

```bash
Authorization: Bearer <jwt-token>
```

### Endpoints

#### Authentication

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "is_superadmin": false
  }
}
```

**Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "123",
  "email": "user@example.com",
  "is_superadmin": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### Groups

**List Groups**
```http
GET /api/groups
Authorization: Bearer <token>

Response: 200 OK
{
  "groups": [
    {
      "id": 1,
      "name": "Engineering",
      "quota_limit": 1000.00,
      "member_count": 5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Create Group**
```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Data Science",
  "quota_limit": 500.00
}

Response: 201 Created
{
  "id": 2,
  "name": "Data Science",
  "quota_limit": 500.00
}
```

#### GRC Keys

**Generate Key**
```http
POST /api/apikey/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production API Key",
  "description": "Key for production services",
  "group_id": 1,
  "governance_url": "https://governance.example.com",
  "otel_endpoint": "http://otel:4318"
}

Response: 201 Created
{
  "key": "grc_018f3c7a-1234-7890-abcd-ef1234567890_base64encodedpayload",
  "id": "018f3c7a-1234-7890-abcd-ef1234567890",
  "name": "Production API Key",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### Metrics

**List Metrics**
```http
GET /api/metrics/list?service=my-service
Authorization: Bearer <token>

Response: 200 OK
{
  "metrics": [
    {
      "metric_name": "http.server.duration",
      "count": 12543,
      "services": ["my-service"]
    }
  ]
}
```

**Query Metric Data**
```http
GET /api/metrics/data?metric_name=http.server.duration&start_time=2024-01-01T00:00:00Z&end_time=2024-01-02T00:00:00Z
Authorization: Bearer <token>

Response: 200 OK
{
  "metric_name": "http.server.duration",
  "data_points": [
    {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "value": 245.67,
      "attributes": {
        "http.method": "GET",
        "http.status_code": 200
      }
    }
  ]
}
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests and linting**: `bun run lint`
5. **Commit**: `git commit -m 'feat: add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions or changes
- `chore:` Maintenance tasks

Examples:
```
feat: add user invitation system
fix: resolve JWT token expiration issue
docs: update deployment guide
refactor: simplify quota calculation logic
```

### Code Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. Code coverage should not decrease
4. Documentation should be updated
5. No console.log or commented-out code

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---