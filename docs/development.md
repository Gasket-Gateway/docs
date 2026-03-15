# Development Environment

The Gasket development environment provides all supporting services needed to run and test Gasket locally, using Docker Compose.

Source: [`development`](https://github.com/Gasket-Gateway/development) repository.

## Prerequisites

### DNS Configuration

Add the following entries to your local DNS server or `/etc/hosts`:

```
127.0.0.1  portal.gasket-dev.local
127.0.0.1  api.gasket-dev.local
127.0.0.1  metrics.gasket-dev.local
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
127.0.0.1  ollama-internal.gasket-dev.local
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

# Reset all services
bash reset-all.sh
```

!!! note
`start-all.sh` delegates to each service's `start.sh`. Traefik's `start.sh` will automatically
generate a self-signed wildcard TLS certificate for `*.gasket-dev.local` on first run.

!!! note
You will need to start the Gasket portal separately

## Test Users and Groups

Authentik is provisioned with the following test accounts (all passwords: `password`):

### Users

| User    | Email           | Groups                                  |
| ------- | --------------- | --------------------------------------- |
| `user1` | user1@localhost | test-users                              |
| `user2` | user2@localhost | test-users, gasket-users                |
| `user3` | user3@localhost | test-users, gasket-users, gasket-admins |

### Groups

| Group         | Members      | Purpose                                                     |
| ------------- | ------------ | ----------------------------------------------------------- |
| test-users    | user1–3      | Open WebUI access                                           |
| gasket-users  | user2, user3 | Gasket Gateway access (user1 excluded for negative testing) |
| gasket-admins | user3        | Gasket admin privileges                                     |

### Application Access

| Application    | Bound Group  | Allowed Users       |
| -------------- | ------------ | ------------------- |
| Gasket Gateway | gasket-users | user2, user3        |
| Open WebUI     | test-users   | user1, user2, user3 |

## Services

### Gasket Portal/API/Metrics

The Gasket application itself. Three instances for HA validation, load balanced by Traefik.

- URL: [portal.gasket-dev.local](https://portal.gasket-dev.local) → load balanced across `:5000`, `:5001`, `:5002`
- URL: [api.gasket-dev.local](https://api.gasket-dev.local) → load balanced across `:5000`, `:5001`, `:5002`
- URL: [metrics.gasket-dev.local](https://metrics.gasket-dev.local) → load balanced across `:9050`, `:9051`, `:9052`
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
