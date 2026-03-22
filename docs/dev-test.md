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
- Admin panel is accessible
- UI demo page loads

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

| Test | Description |
|---|---|
| ROPC token exchange | user2 and user3 receive valid tokens via app passwords |
| user1 denied | user1 (not in gasket-users) gets rejected |
| Invalid password | Wrong credentials are rejected |
| Unauthenticated redirect | Accessing `/` without login redirects to Authentik |
| Browser login (user2) | Selenium login through Authentik UI + portal access |
| Admin access (user3) | Admin panel accessible after Selenium login |
| Health smoke test | `/health` returns 200 |

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

Add test files to `tests/`. They automatically get the test bypass session (user3/admin).

```python
# tests/test_example.py

class TestExample:
    def test_something(self, client):
        response = client.get("/some-endpoint")
        assert response.status_code == 200
```

The `client` fixture is provided by `tests/conftest.py`.

### OIDC Tests

Add test files to `tests/oidc/`. These run against a live environment.

```python
# tests/oidc/test_example.py
from .conftest import fetch_ropc_token, GASKET_URL

class TestExample:
    def test_something(self, browser, gasket_url):
        browser.get(f"{gasket_url}/some-page")
        assert "expected" in browser.page_source
```

Available fixtures from `tests/oidc/conftest.py`:

- `gasket_url` — base URL for the Gasket portal
- `browser` — headless Chromium WebDriver
- `user2_token` — ROPC tokens for user2
- `user3_token` — ROPC tokens for user3
