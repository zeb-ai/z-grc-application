# Quick Start - Deploy Control Panel

Deploy the Z-GRC control panel using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- 2GB RAM minimum

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/zeb-ai/z-grc-application.git
cd z-grc-application
```

### 2. Configure Environment

```bash
cp .env.example .env.docker
```

Generate secrets:

```bash
# JWT Secret
openssl rand -hex 32

# Service API Key
openssl rand -hex 32 | awk '{print "sk_" $1}'
```

Edit `.env.docker`:

```env
DB_TYPE=postgres
DB_HOST=postgres
DB_PASSWORD=your_secure_password
DB_SYNCHRONIZE=false

JWT_SECRET=your_jwt_secret
SERVICE_API_KEYS=sk_your_service_key
```

### 3. Start Services

```bash
docker compose up -d
```

### 4. Access Application

Open `http://localhost:3000`

## Generate API Key

1. Login to the dashboard
2. Navigate to Settings → API Keys
3. Click Generate New Key
4. Configure quotas and policies
5. Copy the generated key

## Next Steps

- [Install Z-GRC Package](https://zeb-ai.github.io/z-grc/how-to-use/#1-for-aws-bedrock-model-calls){:target="_blank"} - Package installation guide
- [Proxy Server Setup](https://zeb-ai.github.io/z-grc/how-to-use/#2-for-claude-code){:target="_blank"} - Standalone proxy guide
- [Self-Host Guide](../application/deployment.md) - Production deployment
