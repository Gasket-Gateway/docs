# Development Environment

The Gasket development environment provides all supporting services needed to run and test Gasket locally, using Docker Compose.

Source: [`development`](https://github.com/ajackson/gg) repository.

## Prerequisites

### DNS Configuration

Add the following entries to your local DNS server or `/etc/hosts`:

```
127.0.0.1  portal.gasket-dev.local
127.0.0.1  traefik.gasket-dev.local
127.0.0.1  traefik-metrics.gasket-dev.local
127.0.0.1  authentik.gasket-dev.local
127.0.0.1  authentik-metrics.gasket-dev.local
127.0.0.1  opensearch.gasket-dev.local
127.0.0.1  opensearch-dashboard.gasket-dev.local
127.0.0.1  prometheus.gasket-dev.local
127.0.0.1  grafana.gasket-dev.local
127.0.0.1  open-webui.gasket-dev.local
127.0.0.1  ollama-external.gasket-dev.local
127.0.0.1  ollama-external-metrics.gasket-dev.local
127.0.0.1  ollama-internal.gasket-dev.local
127.0.0.1  ollama-internal-metrics.gasket-dev.local
127.0.0.1  code-1.gasket-dev.local
127.0.0.1  code-2.gasket-dev.local
127.0.0.1  code-3.gasket-dev.local
```

## Running the Environment

```bash
# Clone the development repo
git clone https://github.com/Gasket-Gateway/development.git

cd development

# Start all supporting services
bash start-all.sh

# Stop all services
bash stop-all.sh
```

!!! note
`start-all.sh` delegates to each service's `start.sh`. Traefik's `start.sh` will automatically
generate a self-signed wildcard TLS certificate for `*.gasket-dev.local` on first run.

!!! note
You will need to start the Gasket portal separately:
`bash
    bash gasket-portal/start.sh
    `
This requires the `gasket:dev` Docker image to be built from the `gasket` repo first.

## Services

### Gasket Portal

The Gasket application itself. Three instances for HA validation, load balanced by Traefik.

- URL: [portal.gasket-dev.local](https://portal.gasket-dev.local) → load balanced across `:5000`, `:5001`, `:5002`
- Traefik uses the `/health` endpoint to validate backend availability before load balancing
- Requires `gasket:dev` image built from the `gasket` repo — start separately: `bash gasket-portal/start.sh`

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

Three separate browser-based VS Code environments, one per test user. Each instance is fronted by its own `oauth2-proxy` enforcing per-user OIDC access (both at the Authentik application policy level and via `--allowed-email` on the proxy).

| Instance | URL                                                        | oauth2-proxy Port | Allowed User |
| -------- | ---------------------------------------------------------- | ----------------- | ------------ |
| 1        | [code-1.gasket-dev.local](https://code-1.gasket-dev.local) | `4180`            | `user1`      |
| 2        | [code-2.gasket-dev.local](https://code-2.gasket-dev.local) | `4181`            | `user2`      |
| 3        | [code-3.gasket-dev.local](https://code-3.gasket-dev.local) | `4182`            | `user3`      |

**Access control (two layers)**:

1. Authentik app policy — each `code-server-N` application is bound to a single specific user pk
2. oauth2-proxy `--allowed-email=userN@localhost` — secondary guard at the proxy level

**Note on test user groups**:

| Group           | Members             | Accesses                               |
| --------------- | ------------------- | -------------------------------------- |
| `test-users`    | user1, user2, user3 | Code Server (own instance), Open WebUI |
| `gasket-users`  | user2, user3        | Gasket Gateway                         |
| `gasket-admins` | user3               | Grafana, OpenSearch Dashboards         |

User1 is intentionally excluded from `gasket-users` to support negative-path testing.
