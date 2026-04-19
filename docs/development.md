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

- Portal: [portal.gasket-dev.local](https://portal.gasket-dev.local) → load balanced across `:5000`, `:5001`, `:5002`
- API: [api.gasket-dev.local](https://api.gasket-dev.local) → load balanced across `:5000`, `:5001`, `:5002`
- Metrics: [metrics.gasket-dev.local/metrics](https://metrics.gasket-dev.local/metrics) → load balanced across `:9050`, `:9051`, `:9052`
- Traefik uses the `/health` endpoint to validate backend availability before load balancing
  - Portal Health: [portal.gasket-dev.local/health](https://portal.gasket-dev.local/health) → load balanced across `:5000`, `:5001`, `:5002`
  - API Health: [api.gasket-dev.local/health](https://api.gasket-dev.local/health) → load balanced across `:5000`, `:5001`, `:5002`
  - Metrics Health: [metrics.gasket-dev.local/health](https://metrics.gasket-dev.local/health) → load balanced across `:9050`, `:9051`, `:9052`

### Traefik

Serves as an ingress proxy — handles TLS termination and hostname-based routing.

- Exposes ports `80` (redirects to HTTPS) and `443`
- UI: [traefik.gasket-dev.local](https://traefik.gasket-dev.local)
- Metrics: [traefik-metrics.gasket-dev.local/metrics](https://traefik-metrics.gasket-dev.local/metrics)

### Authentik

Provides OIDC for user authentication to the portal UI and all other dev environment tools. Includes test users for different access scenarios.

- UI: [authentik.gasket-dev.local](https://authentik.gasket-dev.local)
- Routed via Traefik → `authentik.gasket-dev.local:9443` (unverified HTTPS)
- Metrics: [authentik-metrics.gasket-dev.local/metrics](https://authentik-metrics.gasket-dev.local/metrics)

### OpenSearch

Stores Gasket audit records.

- API: [opensearch.gasket-dev.local](https://opensearch.gasket-dev.local) → `:9200`
- Dashboard: [opensearch-dashboard.gasket-dev.local](https://opensearch-dashboard.gasket-dev.local) → `:5601`

### Prometheus

Scrapes and stores Gasket metrics for monitoring and quota evaluation.

- UI: [prometheus.gasket-dev.local](https://prometheus.gasket-dev.local) → `:9090`

### Grafana

Used to validate Gasket Grafana dashboards.

- UI: [grafana.gasket-dev.local](https://grafana.gasket-dev.local) → `:3000`

### Open WebUI

Validates Open WebUI use cases against the Gasket API.

- UI: [open-webui.gasket-dev.local](https://open-webui.gasket-dev.local) → `:3001`

### Ollama

Stubs OpenAI-compliant backends. Two instances simulate multiple independent endpoints.

| Instance | URL                                                                          | Backend Port |
| -------- | ---------------------------------------------------------------------------- | ------------ |
| External | [ollama-external.gasket-dev.local](https://ollama-external.gasket-dev.local) | `:12434`     |
| Internal | [ollama-internal.gasket-dev.local](https://ollama-internal.gasket-dev.local) | `:11434`     |


# Development & Testing

This page covers how to set up and run the Gasket Gateway test suite.

## Overview

Gasket has two test scripts. Both run inside Docker containers — no host-side Python, Chromium, or test dependencies required.

| Script | What it does | OIDC | Starts Gasket? | Requires |
|---|---|---|---|---|
| `test.sh` | Tests app logic with OIDC **bypassed** | ❌ Mocked (test mode) | ✅ Own instance (`docker-compose-test.yaml`) | Docker only |
| `test-oidc.sh` | Tests real OIDC login flow via Authentik | ✅ Real OIDC | ✅ Own instance (`docker-compose-dev.yaml`) | Full dev environment + `provision.sh` |

Both scripts are self-contained — they build, start, test, and tear down automatically. Previous test results and logs are cleared on each run.

### Key Differences

**`test.sh`** layers `docker-compose-test.yaml` on top of `docker-compose-dev.yaml`, which sets `GASKET_TEST_MODE=1`. This bypasses OIDC and injects a mock admin session (user3 equivalent) for every request, so tests can exercise all portal and admin functionality without Authentik running.

**`test-oidc.sh`** layers `docker-compose-test-runner.yaml` on top of `docker-compose-dev.yaml` — it does **not** set `GASKET_TEST_MODE`, so the real OIDC flow through Authentik is used. This requires the full development environment (Traefik, Authentik, etc.) to be running first.

---

## General Tests (`test.sh`)

### Running

```bash
cd gasket/
./test.sh
```

### What's Tested

- `/health` endpoint returns 200
- Portal page loads and displays test user
- Dedicated `/keys` page loads
- Admin `/admin` redirects to `/admin/status`
- Admin sub-pages load: `/admin/status`, `/admin/backends`, `/admin/profiles`, `/admin/keys`, `/admin/policies`
- Admin status page contains connection status
- UI demo page loads
- Backend CRUD, admin page, and status API
- Profile CRUD, admin page, and config profile handling
- Policy CRUD, versioning, acceptance, reacceptance, and config policy handling
- API key create, read, reveal, edit, revoke, restore, lifecycle, admin management, and policy snapshots

### How Test Mode Works

When `GASKET_TEST_MODE` is set, `create_app()` in `__init__.py`:

1. Skips OIDC initialisation entirely
2. Registers a `before_request` handler that injects a session with:
    - `user_email`: `user3@localhost`
    - `user_name`: `user3`
    - `user_groups`: `["gasket-users", "gasket-admins"]`

---

## OIDC Flow Tests (`test-oidc.sh`)

OIDC tests validate the full authentication flow against a live Authentik instance using:

- **ROPC (Resource Owner Password Credentials)** — `client_credentials` grant with app password tokens
- **Selenium (Chromium headless)** — browser-based login through the Authentik UI (with Shadow DOM piercing)

### Prerequisites

1. The full development environment must be running:

    ```bash
    cd development/
    ./start-all.sh
    ```

2. Authentik must be provisioned with ROPC and implicit consent:

    ```bash
    cd development/authentik/
    ./provision.sh
    ```

    The provisioning script creates app password tokens for test users and configures implicit consent on the Gasket Gateway provider.

### Running

```bash
cd gasket/
./test-oidc.sh
```

### What's Tested

#### Login Flow (`test_oidc_login.py`)

| Test | Description |
|---|---|
| ROPC token exchange | user2 and user3 receive valid tokens via app passwords |
| user1 denied | user1 (not in gasket-users) gets rejected |
| Invalid password | Wrong credentials are rejected |
| Unauthenticated redirect | Accessing `/` without login redirects to Authentik |
| Browser login (user2) | Selenium login through Authentik UI + portal access |
| Admin access (user3) | Admin panel accessible after Selenium login |
| Health smoke test | `/health` returns 200 |

#### Access Control (`test_oidc_access.py`)

| Test | Description |
|---|---|
| Unauthenticated redirects | All protected pages/APIs redirect to login without a session |
| user2 portal access | Portal page, keys page, and user API keys accessible |
| user2 admin denied | All admin pages and admin API endpoints return 403 |
| user2 admin write denied | Create backend/profile/policy via admin API returns 403 |
| user3 portal access | Portal and keys pages accessible |
| user3 admin access | All admin pages and admin API endpoints return 200 |
| Policy acceptance access | user2 sees own acceptances; admin list denied; user3 sees all |

#### Profiles & Policies (`test_oidc_profiles.py`)

| Test | Description |
|---|---|
| Config profile exists | `internal-standard` profile exists with correct structure |
| Profile OIDC groups | Profile has `gasket-users` in `oidc_groups` (returned as list) |
| Profile backends/policies | Profile references `ollama-internal` and `acceptable-use` |
| Admin write access | user2 denied CRUD on profiles; user3 can read single profile |
| Config read-only | Config-sourced profiles cannot be modified or deleted by admin |
| Policy visibility | Config policy exists with content and version |
| Policy acceptance flow | user2 can check, accept, and verify policy acceptance status |
| Admin acceptance view | user3 can view user2's acceptances via admin endpoint |
| User API key create | Key creation gated by policy acceptance; revealed key has `gsk_` prefix |
| Key visibility | Created keys appear in user's list and admin's list |
| Key revocation | user2 can revoke own key; admin can revoke user2's key |
| Cross-user isolation | user2 cannot reveal or revoke user3's keys (404) |
| Backend admin access | user2 denied backend CRUD; user3 can list and read |

#### Portal (`test_oidc_portal.py`)

| Test | Description |
|---|---|
| User profiles API | user2 and user3 can list profiles via `/api/profiles` (group-filtered) |
| Profile visibility | user2 sees `internal-standard` profile (scoped to `gasket-users`) |
| Profile fields | User-facing profiles include all fields needed by the portal UI |
| Profile groups/backends/policies | Profile correctly references `gasket-users`, `ollama-internal`, `acceptable-use` |
| User policy API | user2 and user3 can read policy details via `/api/policies/<id>` |
| Policy content | Policy has name, content, and version for user review |
| Unauthenticated denied | Profile and policy endpoints redirect unauthenticated users to login |
| Portal renders profiles | Browser-level: user2's portal page renders profile cards (not empty) |
| Portal shows profile name | Browser-level: `internal-standard` appears in the rendered portal page |
| Admin link visibility | Browser-level: user3 sees Admin link in navbar; user2 does not |

---

## Test Results & Logs

Both scripts write output to directories with `.gitignore` files:

| Directory | Contents |
|---|---|
| `test-results/` | JUnit XML, HTML reports, failure screenshots (`.png`) |
| `logs/` | `access.log` (HTTP requests), `error.log` (app errors), `gasket.log` (app-level logs) |

Screenshots are only captured when Selenium tests **fail** — if all tests pass, there will be no `.png` files.

---

## Test Users

These users are created by `provision.sh`:

| User | Password | App Token | Groups | Access |
|---|---|---|---|---|
| user1 | `password` | — | test-users | Open WebUI only (negative test) |
| user2 | `password` | `user2-app-password` | test-users, gasket-users | Portal |
| user3 | `password` | `user3-app-password` | test-users, gasket-users, gasket-admins | Portal + Admin |

App password tokens are used for ROPC token exchange (Authentik requires these instead of regular passwords for the `client_credentials` grant).

---

## Docker Compose Files

| File | Purpose |
|---|---|
| `docker-compose-dev.yaml` | Base dev services (postgres + gasket) |
| `docker-compose-test.yaml` | Override: adds `GASKET_TEST_MODE=1` to gasket |
| `docker-compose-test-runner.yaml` | Standalone test-runner with Chromium (no test mode) |
| `Dockerfile.test` | Test runner image (python + chromium + pytest + selenium) |

`test.sh` uses: `docker-compose-dev.yaml` + `docker-compose-test.yaml`
`test-oidc.sh` uses: `docker-compose-dev.yaml` + `docker-compose-test-runner.yaml`

---

## Writing New Tests

### General Tests

Tests are organised into modules under `tests/`:

| Directory          | Contents                                                  |
|--------------------|-----------------------------------------------------------|
| `tests/`           | Top-level tests (health, portal, backends, profiles, etc) |
| `tests/api_keys/`  | API key tests (create, read, edit, revoke, admin, etc)    |
| `tests/policies/`  | Policy tests (CRUD, acceptance, config policies)          |
| `tests/oidc/`      | OIDC flow tests (separate runner, see below)              |

All general tests automatically get the test bypass session (user3/admin).

```python
# tests/test_example.py

class TestExample:
    def test_something(self, client):
        response = client.get("/some-endpoint")
        assert response.status_code == 200
```

The `client` fixture is provided by `tests/conftest.py`. Sub-directories like `tests/api_keys/` have their own `conftest.py` with additional fixtures (e.g. helper functions to create keys, accept policies).

### OIDC Tests

Add test files to `tests/oidc/`. These run against a live environment.

```python
# tests/oidc/test_example.py
from .conftest import GASKET_URL

class TestExample:
    def test_browser_check(self, browser, gasket_url):
        browser.get(f"{gasket_url}/some-page")
        assert "expected" in browser.page_source

    def test_api_as_user2(self, user2_session, gasket_url):
        resp = user2_session.get(f"{gasket_url}/api/keys")
        assert resp.status_code == 200

    def test_api_as_admin(self, user3_session, gasket_url):
        resp = user3_session.get(f"{gasket_url}/admin/api/profiles")
        assert resp.status_code == 200

    def test_unauthenticated(self, anon_session, gasket_url):
        resp = anon_session.get(f"{gasket_url}/admin", allow_redirects=True)
        assert "login" in resp.url.lower()
```

Available fixtures from `tests/oidc/conftest.py`:

- `gasket_url` — base URL for the Gasket portal
- `browser` — headless Chromium WebDriver
- `user2_token` — ROPC tokens for user2
- `user3_token` — ROPC tokens for user3
- `user2_session` — `requests.Session` authenticated as user2 (session scope)
- `user3_session` — `requests.Session` authenticated as user3 (session scope)
- `anon_session` — unauthenticated `requests.Session`

The session-based fixtures log in via Selenium once per test run and extract the Flask session cookies for use in `requests.Session`. This allows API-level access testing without needing the browser for every request.
