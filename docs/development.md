# Development Environment

The Gasket development environment provides all supporting services needed to run and test Gasket locally, using Docker Compose.

Source: [`development`](https://github.com/ajackson/gg) repository.

## Prerequisites

### DNS Configuration

Add the following entries to your local DNS server or `/etc/hosts`:

```
127.0.0.1  portal.gasket-dev.local
127.0.0.1  traefik.gasket-dev.local
127.0.0.1  authentik.gasket-dev.local
127.0.0.1  opensearch.gasket-dev.local
127.0.0.1  opensearch-dashboard.gasket-dev.local
127.0.0.1  prometheus.gasket-dev.local
127.0.0.1  grafana.gasket-dev.local
127.0.0.1  open-webui.gasket-dev.local
127.0.0.1  ollama-external.gasket-dev.local
127.0.0.1  ollama-internal.gasket-dev.local
127.0.0.1  code.gasket-dev.local
```

## Running the Environment

```bash
# Clone the development repo
git clone https://github.com/Gasket-Gateway/development.git

cd development

# Start all services
bash start-all.sh
```

!!! note
You will need to start the Gasket portal separately (from the `gasket` repo).

## Services

### Gasket Portal

The Gasket application itself. Assumes you are running it separately (from the `gasket` repo).

- URL: [portal.gasket-dev.local](https://portal.gasket-dev.local) → load balanced across `:5000`, `:5001`, `:5002`
- Traefik uses the `/health` endpoint to validate backend availability before load balancing

### Traefik

Serves as an ingress proxy — handles TLS termination and hostname-based routing.

- Exposes ports `80` (redirects to HTTPS) and `443`
- UI: [traefik.gasket-dev.local](https://traefik.gasket-dev.local)

### Authentik

Provides OIDC for user authentication to the portal UI and all other dev environment tools. Includes test users for different access scenarios.

- URL: [authentik.gasket-dev.local](https://authentik.gasket-dev.local)
- Routed via Traefik → `authentik.gasket-dev.local:9443` (unverified HTTPS)

### OpenSearch

Stores Gasket audit records.

- API: [opensearch.gasket-dev.local](https://opensearch.gasket-dev.local) → `:9200`
- Dashboard: [opensearch-dashboard.gasket-dev.local](https://opensearch-dashboard.gasket-dev.local) → `:5601`

### Prometheus

Scrapes and stores Gasket metrics for monitoring and quota evaluation.

- URL: [prometheus.gasket-dev.local](https://prometheus.gasket-dev.local) → `:9090`

### Grafana

Used to validate Gasket Grafana dashboards.

- URL: [grafana.gasket-dev.local](https://grafana.gasket-dev.local) → `:3000`

### Open WebUI

Validates Open WebUI use cases against the Gasket API.

- URL: [open-webui.gasket-dev.local](https://open-webui.gasket-dev.local) → `:3001`

### Ollama

Stubs OpenAI-compliant backends. Two instances simulate multiple independent endpoints.

| Instance | URL                                                                          | Backend Port |
| -------- | ---------------------------------------------------------------------------- | ------------ |
| External | [ollama-external.gasket-dev.local](https://ollama-external.gasket-dev.local) | `:12434`     |
| Internal | [ollama-internal.gasket-dev.local](https://ollama-internal.gasket-dev.local) | `:11434`     |

### Code Server

Provides a browser-based VS Code environment for validating the VSCode Continue plugin use cases.

- URL: [code.gasket-dev.local](https://code.gasket-dev.local) → `:8443` (unverified HTTPS)
