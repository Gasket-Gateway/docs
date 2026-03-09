# Gasket Gateway

Gasket is an API gateway for OpenAI-compliant inference backends. It provides a portal for users to work with these backends within an organisational context, including enterprise capabilities such as SSO, organisational policy, auditing, monitoring, and quotas.

## What is Gasket?

```
                     ┌──────────────────────────────┐
  Browser Users      │             Gasket           │
  ──(OIDC SSO)────►o─│───Portal UI                  │
                     │                              │    ┌─► OpenAI Backend A
  API Clients        │   Gateway API ───────────────┼────┼─► OpenAI Backend B
  ──(API key)─────►o─│───(proxy / agg)              │    └─► OpenAI Backend C
  (Open WebUI,       │                              │
   VSCode, etc.)     └───────────────────┬──────────┘
                                         │
            ┌───────────────┬────────────┼──────────────┐
            │               │            │              │
      PostgreSQL       OpenSearch   Prometheus      OIDC Provider
      (keys, prefs,   (audit logs) (metrics,           (SSO)
    quotas, blocks)                 quota queries)
```

## Key Features

- **OIDC Single Sign-On** — Login via your organisation's identity provider
- **Backend Profiles** — Group and govern access to multiple OpenAI-compatible backends
- **API Key Management** — Users create and manage API keys with per-profile policies
- **Quotas & Monitoring** — Token usage quotas enforced via Prometheus metrics
- **Audit Logging** — Request metadata (and optionally full content) written to OpenSearch
- **Admin Panel** — Full visibility into keys, audit records, quotas and backend health
- **Open WebUI & VSCode Support** — Native integration with Open WebUI and the Continue extension

## Repositories

| Repo          | Description                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `gasket`      | The main Gasket application (Flask, portal UI, gateway)                                                  |
| `development` | Local development environment (Traefik, Authentik, OpenSearch, Prometheus, Grafana, Ollama, Code Server) |
| `helm`        | Kubernetes Helm charts for production deployment                                                         |
| `docs`        | This documentation site                                                                                  |

## Quick Links

- [Architecture](architecture.md) — Component overview and technology stack
- [Requirements](requirements.md) — Detailed functional requirements
- [Development Environment](development.md) — Local dev setup guide
- [Helm Deployment](helm.md) — Kubernetes deployment

!!! note "Open WebUI Integration"
Gasket supports extracting Open WebUI user identity from request headers, enabling per-Open-WebUI-user metrics, quotas, and audit records. See [Open WebUI Integration](open-webui.md).

!!! note "VSCode Continue Extension"
Gasket can generate a VSCode Continue plugin config snippet for any API key. See [API Key Management](api-keys.md).
