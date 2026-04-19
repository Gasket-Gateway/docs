# Gasket Gateway

Gasket is an API gateway for OpenAI-compliant inference backends. It provides a portal for users to work with these backends within an organisational context, including enterprise capabilities such as SSO, organisational policy, auditing, monitoring, and quotas.

## Architecture

![System Diagram](assets/diagrams/architecture.drawio.png)

## Key Features

- **OIDC Single Sign-On** — Login via your organisation's identity provider
- **Backend Profiles** — Group and govern access to multiple OpenAI-compatible backends
- **API Key Management** — Users create and manage API keys with per-profile policies
- **Quotas & Monitoring** — Token usage quotas
- **Audit Logging** — Request metadata (and optionally full content) written to OpenSearch
- **Admin Panel** — Full visibility into keys, audit records, quotas and backend health
- **Open WebUI & VSCode Support** — Native integration with Open WebUI and the Continue extension

## Repositories

| Repo                                                         | Description                                                                                              |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| [gasket](https://github.com/Gasket-Gateway/gasket)           | The main Gasket application (Flask, portal UI, gateway)                                                  |
| [development](https://github.com/Gasket-Gateway/development) | Local development environment (Traefik, Authentik, OpenSearch, Prometheus, Grafana, Ollama, Code Server) |
| [helm](https://github.com/Gasket-Gateway/helm)               | Kubernetes Helm charts for production deployment                                                         |
| [docs](https://github.com/Gasket-Gateway/docs)               | This documentation site                                                                                  |

## Quick Links

- [Architecture](architecture.md) — Component overview and technology stack
- [Requirements](requirements.md) — Detailed functional requirements
- [Development Environment](development.md) — Local dev setup guide
- [Helm Deployment](deployment.md#helm-deployment) — Kubernetes deployment

!!! note "Open WebUI Integration"
Gasket supports extracting Open WebUI user identity from request headers, enabling per-Open-WebUI-user metrics, quotas, and audit records. See [Open WebUI Integration](portal-and-gateway.md#open-webui-integration).

!!! note "VSCode Continue Extension"
Gasket can generate a VSCode Continue plugin config snippet for any API key. See [API Key Management](portal-and-gateway.md#api-key-management).


# About Gasket Gateway

Hi,

Yes I am a 1 person team.

Yes Gasket Gateway is vibe coded.

Yes it should be used with caution.

I am a generalist platform engineer based in Australia, and I made Gasket Gateway because I wanted to see what is possible with the power of AI tooling on my side. Feel free to use Gasket Gateway for your own purposes (provided you adhere to the Apache 2.0 licence). Also, feel free to submit issues on GitHub and I'll see if it is something I can fix/incorporate. I will be upfront in that I may not take on feature requests or accept pull requests as I have my own use cases for Gasket Gateway and would prefer not to deviate from my own requirements.
