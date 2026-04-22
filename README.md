# Governance Engine UI

A modern, production-ready governance and API cost management system with built-in OpenTelemetry observability.

## Features

- **Multi-Database Support**: PostgreSQL, MySQL, MongoDB, SQLite, MSSQL
- **User & Group Management**: Role-based access control with fine-grained permissions
- **API Key Management**: Generate and manage service API keys for external applications
- **Cost Control**: Track and limit API costs per user and group with real-time quota management
- **OpenTelemetry Integration**: Built-in metrics, traces, and logs collection via OTEL Collector
- **ClickHouse Analytics**: High-performance telemetry data storage and querying
- **Modern UI**: Built with Next.js 16, React 19, shadcn/ui, and Tailwind CSS

---

## Quick Start (Docker - Recommended)

The fastest way to get started is using Docker Compose:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd governance-ui

# 2. Copy environment file and configure
cp .env.docker .env.docker.local

# 3. ⚠️ IMPORTANT: Update security settings in .env.docker.local
# - Change JWT_SECRET
# - Change SERVICE_API_KEYS
# - Change DB_PASSWORD (and update docker-compose.yaml)

# 4. Start all services
docker-compose up -d

# 5. Access the application
open http://localhost:3000
```

**That's it!** The complete stack (database, ClickHouse, OTEL collector, and UI) is now running.

For detailed Docker deployment guide, see [DOCKER.md](./DOCKER.md).

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+ or Bun 1.0+
- PostgreSQL/MySQL/MongoDB (choose one)
- ClickHouse (optional, for telemetry features)
- OTEL Collector (optional, for observability)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd governance-ui

# 2. Install dependencies
bun install
# or
npm install

# 3. Configure environment
cp .env.example .env.local

# Edit .env.local with your database credentials
nano .env.local

# 4. Start development server
bun dev
# or
npm run dev

# 5. Open your browser
open http://localhost:3000
```

---

## Configuration

### Database Setup

The application supports multiple databases. Configure via environment variables:

#### PostgreSQL (Recommended)

```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=governance_engine
```

#### MySQL

```bash
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=governance_engine
```

#### MongoDB

```bash
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/governance_engine
```

#### SQLite (Development only)

```bash
DB_TYPE=sqlite
DB_SQLITE_PATH=./data/governance.db
```

### ClickHouse & Observability

For telemetry features (metrics, traces, logs):

```bash
CLICKHOUSE_HOST=http://localhost:8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default

OTEL_ENDPOINT=http://localhost:4318
```

### Authentication

```bash
# Generate a strong secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Service API Keys

```bash
# Generate keys for external applications:
# node -e "console.log('sk_' + require('crypto').randomBytes(32).toString('hex'))"
SERVICE_API_KEYS=sk_your_service_key_here,sk_another_key
```

See [.env.example](./.env.example) for all configuration options.

---

## Development

### Available Scripts

```bash
# Start development server
bun dev          # or npm run dev

# Build for production
bun run build    # or npm run build

# Start production server
bun start        # or npm start

# Lint and format code
bun run lint     # or npm run lint
bun run format   # or npm run format
```

### Project Structure

```
governance-ui/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes (backend)
│   │   └── ...           # Frontend pages
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── database/         # TypeORM entities and migrations
│   ├── clickhouse/       # ClickHouse queries and schemas
│   ├── types/            # TypeScript type definitions
│   └── config/           # Configuration files
├── public/               # Static assets
├── docker-compose.yaml   # Docker services orchestration
├── Dockerfile            # Application container
├── otel-config.yaml      # OpenTelemetry collector config
└── .env.example          # Environment variables template
```

---

## Docker Deployment

### Architecture

```
┌─────────────────────┐
│   Governance UI     │  Port 3000 (Next.js + Bun)
└──────────┬──────────┘
           │
           ├─────────► PostgreSQL (Port 5432)
           ├─────────► ClickHouse (Ports 8123, 9000)
           └─────────► OTEL Collector (Ports 4317, 4318)
```

### Services

| Service | Purpose | Port |
|---------|---------|------|
| `governance-ui` | Main application | 3000 |
| `postgres` | Primary database | 5432 |
| `clickhouse` | Telemetry storage | 8123, 9000 |
| `otel-collector` | Observability collection | 4317, 4318 |

### Production Deployment

1. **Update security settings** in `.env.docker`:
   - Change `JWT_SECRET`
   - Change `SERVICE_API_KEYS`
   - Change all database passwords
   - Set `DB_SYNCHRONIZE=false`
   - Set `DB_LOGGING=false`

2. **Use a reverse proxy** (Nginx/Caddy) with SSL/TLS

3. **Set up backups** for databases and volumes

4. **Configure monitoring** and alerting

See [DOCKER.md](./DOCKER.md) for comprehensive deployment guide.

---

## API Documentation

### Authentication

All API endpoints require authentication via JWT tokens (except `/api/auth/login` and `/api/auth/register`).

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the token in subsequent requests
curl http://localhost:3000/api/users/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### External Service API Keys

For external applications to generate GRC keys:

```bash
curl -X POST http://localhost:3000/api/external/apikey/generate \
  -H "x-service-api-key: sk_your_service_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "groupId": "group-uuid",
    "description": "Production API Key"
  }'
```

### Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/groups` - List groups
- `POST /api/apikey` - Generate API key
- `POST /api/quota/consume` - Consume quota
- `GET /api/metrics/stats` - Get metrics statistics
- `GET /api/telemetry/traces` - Get trace data
- `GET /api/logs` - Get logs

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun (production) / Node.js (compatible)
- **UI**: React 19, shadcn/ui, Tailwind CSS 4, Framer Motion
- **Database**: TypeORM (multi-database support)
- **Telemetry**: ClickHouse + OpenTelemetry
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Charts**: Recharts
- **Icons**: Phosphor Icons, Lucide React

---

## Features Deep Dive

### User Management
- Create and manage users
- Role-based permissions
- Email/password authentication
- JWT token-based sessions

### Group Management
- Create hierarchical groups
- Assign users to groups
- Set group-level permissions
- Group-based quota management

### API Key Management
- Generate secure API keys for services
- Set expiration dates
- Revoke keys anytime
- Track key usage

### Cost Control & Quotas
- Set dollar-based cost limits per user/group
- Real-time quota tracking
- Automatic quota enforcement
- Usage analytics and reporting

### Observability
- Collect metrics, traces, and logs via OTEL
- Store in ClickHouse for high-performance queries
- Built-in dashboards for visualization
- Integration with existing OTEL infrastructure

---

## Database Schema

The application uses TypeORM with automatic schema synchronization (in development). Key entities:

- **User**: User accounts with authentication
- **Group**: Organizational groups
- **GroupMember**: User-group relationships with quotas
- **ApiKey**: Service API keys with metadata
- **GroupPermission**: Fine-grained access control

For production, set `DB_SYNCHRONIZE=false` and manage migrations manually.

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection failed:**
- Verify database is running
- Check credentials in `.env.local`
- Ensure database exists

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
bun install
bun run build
```

**Docker issues:**
```bash
# Reset Docker environment
docker-compose down -v
docker-compose up -d --build
```

See [DOCKER.md](./DOCKER.md) for more troubleshooting tips.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (use `bun run lint`)
- Format code before committing (`bun run format`)
- Write meaningful commit messages
- Update documentation for new features

---

## Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please email [security@example.com](mailto:security@example.com). Do not open public issues for security concerns.

### Security Best Practices

- Always change default credentials
- Use strong, random secrets for JWT and API keys
- Enable SSL/TLS for production deployments
- Keep dependencies up to date
- Set `DB_SYNCHRONIZE=false` in production
- Use environment variables for sensitive data
- Implement rate limiting for public endpoints

---

## License

[Your License Here - MIT/Apache/etc.]

---

## Support

- **Documentation**: [DOCKER.md](./DOCKER.md)
- **Issues**: https://github.com/your-repo/issues
- **Discussions**: https://github.com/your-repo/discussions
- **Email**: support@example.com

---

## Roadmap

- [ ] Multi-tenancy support
- [ ] Advanced RBAC with custom roles
- [ ] Webhook notifications
- [ ] Grafana dashboard templates
- [ ] Kubernetes Helm charts
- [ ] API rate limiting
- [ ] Audit logging
- [ ] SSO/SAML integration

---

Built with ❤️ using Next.js, Bun, and OpenTelemetry