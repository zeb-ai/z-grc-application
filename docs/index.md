# Z-GRC Documentation

Welcome to **Z-GRC** (Governance, Risk and Compliance) - an enterprise-grade AI governance control panel for LLM applications. Z-GRC provides centralized control, policy enforcement and comprehensive observability for your AI infrastructure.

## What is Z-GRC?

Z-GRC is a **Control Panel + Runtime SDK + Proxy Server CLI based applications (Claude Code, codex)** architecture consisting of three main components:

### Z-GRC Control Panel
A centralized web application for governing your AI infrastructure. Think of it as **mission control** for your LLM operations:

- **Centralized API Key Management** - Generate keys with embedded policies and quotas
- **User Groups & RBAC** - Fine-grained access control across teams and projects
- **Real-Time Telemetry** - Monitor traces, metrics, and distributed logging
- **Cost Analytics Dashboard** - Track spending, usage trends, and system health
- **Self-Hostable** - Deploy on your infrastructure with complete data control

### Z-GRC Package (Runtime SDK)
A lightweight Python package that integrates governance policies directly into your application runtime:

- **Zero-Code Integration** - Single line initialization in your application
- **Automatic SDK Detection** - Works with Anthropic, OpenAI, AWS Bedrock, Azure OpenAI
- **Pre-Flight Policy Enforcement** - Validates quotas before LLM calls execute
- **Framework Agnostic** - Compatible with PydanticAI, LangChain, Strands Agents and others [WIP]
- **Full Streaming Support** - Accurate token tracking for streaming responses

### Z-GRC Proxy Server (Network-Level Governance)
A transparent network proxy for governance enforcement without code modifications:

- **Zero Code Changes** - Deploy governance without modifying application code
- **Universal Compatibility** - Works with any application making LLM API calls
- **Transparent Interception** - Network-level traffic interception and validation
- **Full Policy Enforcement** - Identical governance capabilities as Runtime SDK
- **Service Mode** - Operates as background daemon or system service


## Features

### Dashboard, User Groups & API Key Management

Centralized control panel for managing your AI governance infrastructure with role-based access control and fine-grained permissions.

**Key Capabilities:**

- **User Group Management**: Organize users into groups with shared quotas and policies
- **API Key Generation**: Create keys with embedded policies, quotas, and expiration dates
- **Role-Based Access Control**: Assign permissions at user and group levels
- **Policy Configuration**: Define token limits, cost thresholds, and rate limits
- **Real-Time Dashboard**: Monitor active keys, usage statistics, and system health

<video width="100%" controls>
  <source src="assets/videos/dashboard-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### OpenTelemetry & Monitoring

Comprehensive observability and telemetry collection for all LLM interactions across your organization.

**Key Capabilities:**

- **Real-Time Telemetry**: Live token usage, cost tracking, and request metrics
- **OpenTelemetry Integration**: Standards-based observability with OTLP protocol
- **ClickHouse Analytics**: High-performance telemetry storage and querying
- **Cost Analytics**: Track spending by user, group, model, and time period
- **Usage Patterns**: Identify trends, anomalies, and optimization opportunities
- **Distributed Tracing**: End-to-end visibility of LLM request flows

<video width="100%" controls>
  <source src="assets/videos/monitoring-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### Feature Comparison

| Feature | Control Panel | Runtime SDK | Proxy Server |
|---------|---------------|-------------|--------------|
| API Key Generation | Yes | - | - |
| Policy Management | Yes | - | - |
| User & Group Management | Yes | - | - |
| Telemetry Dashboard | Yes | - | - |
| LLM Call Interception | - | Yes | Yes |
| Quota Enforcement | - | Yes | Yes |
| Auto-Instrumentation | - | Yes | - |
| Multi-Provider Support | - | Yes | Yes |
| Zero Code Changes | - | - | Yes |


## Use Cases

### Enterprise AI Gateway
Deploy as a proxy layer for organizational AI usage, controlling access to models and maintaining audit trails.

### Multi-Tenant Applications
Isolate resources per customer with group-based quotas and independent usage tracking.

### Development Team Management
Issue individual API keys with granular permissions and monitor usage patterns across teams.

### Compliance & Auditing
Maintain comprehensive logs of AI interactions with user attribution and cost data for regulatory compliance.

### Cost Control
Set budget limits, analyze spending patterns, and prevent runaway costs through real-time enforcement.

## Next Steps

1. **[Deploy Control Panel](getting-started/quickstart-application.md)** - Deploy the application
2. **[Install Package](https://zeb-ai.github.io/z-grc/how-to-use/#1-for-aws-bedrock-model-calls){:target="_blank"}** - Integrate the runtime SDK
3. **[Proxy Server](https://zeb-ai.github.io/z-grc/how-to-use/#2-for-claude-code){:target="_blank"}** - Setup standalone proxy
4. **[Self-Host Guide](application/deployment.md)** - Production deployment

---

**License**: MIT | **Maintained by**: [Zeb Labs](https://github.com/zeb-ai)