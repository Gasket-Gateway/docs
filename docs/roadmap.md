# Roadmap

Outstanding features and tasks derived from comparing the [requirements](requirements.md) against the current codebase. Items are grouped by category.

---

## API Proxy / Gateway Engine

The core proxy that sits between API clients and OpenAI-compliant backends. This is the central feature that all monitoring, audit, and quota systems depend on.

- **Multi-backend routing** — When a backend profile has multiple backends assigned, implement a routing strategy. *Interim solution: Use client IP-based sticky sessions. This requires ensuring the true client IP header (e.g., X-Forwarded-For) is correctly passed through Traefik or the deployment's ingress gateway.*

---

## Allowed Models Filtering

Backend profiles can optionally restrict which models are available through the profile. This requires changes across schema, APIs, UI, and the proxy engine.

- **Database schema — allowed_models column** — Add an `allowed_models` text column to the `backend_profiles` table to store a comma-separated list of permitted model names. An empty value means all models are allowed. Requires an Alembic migration.
- **Config seeding support** — Allow `allowed_models` to be specified in `config.yaml` backend profile definitions and seeded on startup.
- **Admin API — allowed_models in profile CRUD** — Update the profile create/update API endpoints (`/admin/api/profiles`) to accept and return the `allowed_models` field.
- **Admin UI — allowed_models on profiles page** — Add an allowed models input field to the backend profile create/edit forms in the admin panel. Display the configured models in the profile list/detail view.
- **Portal UI — show allowed models** — Display the allowed models for each profile in the user portal so users know which models they can use through their API keys.
- **Proxy — model request validation** — In the `/v1/*` proxy middleware, extract the `model` field from incoming request bodies (e.g. `/v1/chat/completions`, `/v1/completions`) and reject requests with a 403 if the model is not in the profile's allowed list.
- **Proxy — filter /v1/models responses** — When proxying `/v1/models` list responses from upstream backends, filter the returned model list to include only models permitted by the profile's allowed list.
- **Allowed models filtering tests** — End-to-end tests verifying: model request blocking, `/v1/models` response filtering, and unrestricted access when allowed_models is empty. Depends on proxy engine.

---

## Audit — OpenSearch Integration

Audit record writing to OpenSearch is defined in the requirements but not yet implemented beyond the health check.

- **Write metadata audit records** — On every proxied request, write an audit record to OpenSearch containing: user, api_key, model, backend, timestamps, and token counts. Controlled by the `metadata_audit` flag on the backend profile.
- **Write full content audit records** — When `content_audit` is enabled on a backend profile, store the complete request body and complete response body (including assembled streaming content) in the audit record.
- **Streaming request aggregation** — Aggregate individual SSE chunks from streaming responses into a single consolidated audit record per request.
- **Open WebUI identity in audit** — When Open WebUI header support is active and headers are present, include the Open WebUI user identity in audit records alongside the Gasket user identity.
- **OpenSearch index management** — Define the OpenSearch index mapping/template for audit records. Handle index creation, naming conventions (e.g. daily indices), and lifecycle.

---

## Admin Panel — Audit Records Page

Currently a placeholder page at `/admin/audit`. Depends on audit writing being in place.

- **Search and filter interface** — Build the UI for querying OpenSearch audit records by user, API key, model, backend, and time range. Route exists but renders a placeholder.
- **Metadata view** — Display audit record metadata (user, timestamps, token counts, backend) in a browsable table/list.
- **Full content view** — Expandable view showing full request/response content for audit records where content audit was enabled.
- **Conversation thread aggregation** — Group related audit records into conversation threads (e.g. by session or request chain).
- **Histograms** — Show request/response count and token usage over time using charts or visual indicators.

---

## Prometheus Metrics

The metrics server exists but only returns a static stub. No real metrics are being collected or exposed.

- **Instrument proxy with Prometheus counters/histograms** — Integrate `prometheus_client` to record: token usage, API call latency, API call success/failure. All metrics must carry labels: `user`, `api_key`, `backend_profile`, `openai_backend`, `model`.
- **Daily active unique user gauges** — Track and expose: daily active unique API users (Gasket), daily active unique API users (Open WebUI), daily active unique API users (combined), and daily active unique Portal users.
- **Metrics aggregation across HA instances** — Implement eventual/background writes of instance stats to PostgreSQL, and have the `/metrics` endpoint read and aggregate cluster-wide metrics from the DB. The current `/metrics` endpoint returns a static stub.
- **Open WebUI identity in metrics labels** — When Open WebUI header support is active, include Open WebUI user identity in Prometheus metric labels.

---

## Admin Panel — Usage Metrics Page

Currently a placeholder page at `/admin/usage`. Depends on Prometheus metrics being functional.

- **Usage metrics dashboard UI** — Build the admin dashboard showing aggregate token usage, latency, and success/failure rates. Route exists but renders a placeholder.
- **Backend-level metrics view** — OpenAI backend dashboard showing per-backend connection status and usage metrics.
- **Profile-level metrics view** — Backend profile dashboard showing per-profile usage metrics.

---

## Quotas — Enforcement Engine

Quota configuration fields exist on the backend profile model conceptually but quota enforcement logic is not implemented.

- **Quota configuration on backend profiles** — Add quota configuration fields to backend profiles: maximum tokens (`X`) and rolling time period in hours (`Y`). Currently the model has no quota config columns. Requires Alembic migration.
- **Quota block status table** — Create a database table to store active block statuses with expiry timestamps (user/key/scope/expiry). Requires Alembic migration.
- **Pre-request block check** — On every incoming proxied request, check the database for active block status before forwarding to the backend. Return HTTP 429 if blocked.
- **Post-request background quota evaluation** — After a successful proxied request, trigger a background task to evaluate token consumption against configured quotas. If exceeded, write a block status with expiry to the database.
- **Quota scope enforcement** — Implement all five quota scopes: per API key, per Gasket user per profile, per Open WebUI user per profile, per Gasket user globally, per Open WebUI user globally.
- **Admin quota configuration UI** — Add quota configuration fields to the backend profile create/edit forms in the admin panel.

---

## Admin Panel — Quotas Page

Currently a placeholder page at `/admin/quotas`. Depends on the quota engine being in place.

- **Quotas dashboard UI** — Build the admin dashboard showing current quota consumption and active block statuses. Route exists but renders a placeholder.
- **Block status management** — Allow admins to view, and potentially clear, active quota blocks.

---

## User Portal Enhancements

Several portal features defined in requirements are not yet present.

- **View accepted policy records** — Users should be able to view a list of policies they have accepted, showing: policy name, policy version, backend profile, and acceptance timestamp. The API endpoint exists (`/admin/api/policies/my-acceptances`) but is under the admin blueprint — no portal UI renders this.
- **Policy reacceptance prompts** — When a policy with reacceptance enforcement has been updated, prompt the user to reaccept before they can create new API keys. The backend logic for checking exists but the portal UI doesn't surface reacceptance prompts.
- **Connection status / backend health** — Portal users should be able to see connection status for their available backends. Currently only available in the admin panel.
- **Usage metrics for user's backends** — Users should be able to see their own usage metrics for available backends and backend profiles. Depends on Prometheus metrics.
- **Quota usage for user's keys** — Users should be able to see their own quota consumption. Depends on quota engine.
- **Per-key usage metrics** — Show usage metrics when viewing/editing an individual API key in the portal. Depends on Prometheus metrics.
- **Per-key quota usage** — Show quota usage when viewing/editing an individual API key in the portal. Depends on quota engine.
- **Per-key accepted policy versions** — Show the accepted policy version snapshots in the portal key detail view. The API exists (`/api/keys/<id>/policies`) but the portal UI doesn't render them in the key detail modal.

---

## VSCode Continue Integration

The opt-in flag is stored on the API key and can be toggled, but the config snippet generation is not implemented.

- **Generate Continue config snippet** — For API keys with `vscode_continue` enabled, generate a ready-to-use VSCode Continue extension config JSON snippet pointing at the Gasket gateway endpoint with the API key pre-filled.
- **Display snippet in portal key detail** — Show the generated Continue config snippet in the portal key detail view with copy-to-clipboard support.
- **Template all opted-in keys** — Provide a way to generate/download a combined Continue config covering all of a user's opted-in API keys.

---

## Open WebUI Header Support

The opt-in flags exist on backend profiles and API keys, but the actual header processing logic is not implemented.

- **Read and validate Open WebUI identity headers** — When both the backend profile and API key have Open WebUI support enabled, extract the Open WebUI user identity from incoming request headers.
- **Fall back to Gasket user identity** — When Open WebUI headers are absent on an opted-in key, fall back to the Gasket user identity for audit, metrics, and quotas.
- **Open WebUI identity in audit/metrics/quotas** — Use the extracted Open WebUI identity for audit record attribution, Prometheus metric labels, and quota evaluation. Depends on audit, metrics, and quota sections.

---

## Admin Panel — Key Management Enhancements

Most admin key management is implemented. A few items from requirements are outstanding.

- **Per-key usage metrics in admin view** — Show usage metrics alongside each API key in the admin keys table. Depends on Prometheus metrics.
- **Per-key quota usage in admin view** — Show quota consumption and active block status alongside each API key. Depends on quota engine.
- **Accepted policies display in admin keys table** — Show the accepted policy versions that apply to each key directly in the admin key table/list (currently only available via a separate API call and modal).

---

## Admin Panel — Backend & Profile Dashboards

- **OpenAI backend usage dashboard** — Backend-level view showing connection status alongside per-backend usage metrics. Currently backends page shows CRUD and connectivity but no usage data. Depends on Prometheus metrics.
- **Backend profile usage dashboard** — Profile-level view showing per-profile usage metrics and quota consumption. Currently profiles page shows CRUD but no usage data. Depends on metrics and quotas.

---

## Rate Limiting

_# no current tasks_

---

## Notifications & Alerts

_# no current tasks_

---

## User Management

_# no current tasks_

---

## API (Non-Proxy)

_# no current tasks_

---

## User Interface

- **Refactor UI Theme** — Replace the current neo-brutalism design with a more professional, modern theme.
- **Remove Uppercase Transformations** — Ensure all UI strings retain their intended casing rather than being forced to uppercase.

---

## Deployment & Infrastructure

- **Investigate HA container startup issues** — Gasket instances in the HA configuration (`docker-compose.yaml`) fail to resolve or connect to local dev hostnames (e.g., Authentik) on startup, resulting in 500 errors during login. Investigate networking/DNS differences between the HA and single-instance configurations.

---

## Security Hardening

_# no current tasks_

---

## Documentation

_# no current tasks_

---

## Codebase Cleanup

- **Delete old monolithic templates** — `gasket/app/templates/portal.html` (35KB) and `gasket/app/templates/admin.html` (88KB) are no longer referenced by any route. They are leftovers from the template refactoring in 0.1.5 and should be deleted.
- **Delete old monolithic test files** — `gasket/tests/test_api_keys.py` (47KB) and `gasket/tests/test_policies.py` (25KB) exist alongside the modular `tests/api_keys/` and `tests/policies/` directories. If the modular versions are the active ones, these old files should be deleted.


---

## Testing & Quality

- **Proxy / gateway integration tests** — End-to-end tests for the API proxy flow: key auth → routing → upstream call → response. Depends on proxy engine.
- **Audit record tests** — Verify audit records are correctly written to OpenSearch for metadata-only and full-content scenarios. Depends on audit integration.
- **Metrics endpoint tests** — Verify Prometheus metrics are correctly exposed with the expected labels and values. Depends on Prometheus metrics.
- **Quota enforcement tests** — Verify quota block/unblock lifecycle, all quota scopes, and 429 responses. Depends on quota engine.
- **Open WebUI header tests** — Verify header extraction, fallback behaviour, and identity propagation to audit/metrics/quotas. Depends on Open WebUI header support.
- **VSCode Continue snippet tests** — Verify correct snippet generation for opted-in keys. Depends on Continue integration.
- **Selenium RBAC Web UI testing (High Priority)** — Add Selenium tests to verify RBAC flows from the web UI. Depends on the RBAC testing uplift.
