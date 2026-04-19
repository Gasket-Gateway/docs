# Project Requirements

Full functional requirements for the Gasket Gateway.

## Application

- Python Flask application (Exposed on default port `5000` and metrics port `9050`)
- Supports multiple concurrent instances (high availability) sharing the same PostgreSQL and OpenSearch, with OIDC session state persisted across instances
- UI built with plain HTML, CSS, and JavaScript — no external UI libraries or JavaScript frameworks
- `:5000/health` endpoint returning 200 OK
- `:5000/v1/*` proxy endpoint accepting API key authenticated requests and forwarding them to OpenAI-compliant backends (see [API Proxy](#api-proxy))
- `:9050/health` endpoint returning 200 OK (confirms the metrics server is running)
- `:9050/metrics` endpoint returning Prometheus metrics. Instances eventually write stats to PostgreSQL, and the endpoint aggregates data via DB read query across all instances (uses different port `9050` to isolate from main traffic)
- Custom error pages for HTTP errors (403, 404, 500, etc.) — no stack traces or internal details exposed to users
- The `/ui-demo` route must only be accessible when the application is running in test mode (e.g. debug mode); otherwise it should be disabled or return a 404

## Database & Schema Management

- All database schema changes must be managed via Alembic migrations
- Migrations are automatically applied on application startup (`alembic upgrade head`)
- Every migration must include both `upgrade()` and `downgrade()` functions
- Migrations are append-only — never modify a migration that has been applied to any environment
- Migration files live in `migrations/versions/` and are tracked in version control

## Configuration

- YAML config file for all settings
- Config option to disable TLS verification for the OIDC provider and OpenSearch
- Config option for portal banners (banner content, banner colour)
- Default light/dark mode preference from config

## Authentication & Access

- OIDC login
- OIDC groups for:
  - General user access
  - Admin panel access
  - Per-backend-profile access
- Logout button URL from config
- User OIDC session timeout (configurable, default 8 hours)

## Backend Profiles

Backend profiles define how access to one or more OpenAI-compliant backends is governed:

- Name and description
- One or more assigned policies (see [Policies](#policies)) — users must accept all assigned policies before they can create API keys for the applicable backend profile
- Whether metadata audit is enabled
- Whether full request/response content audit is enabled
- List of OpenAI backends
- Default or enforced API key expiry duration
- Usage quota configurations (configurable X tokens per Y hour block, see [Monitoring & Quotas](portal-and-gateway.md#monitoring-quotas))
- Maximum number of active API keys per user
- Optional list of allowed models — when set, only the specified model names may be used through this profile. The proxy will reject requests specifying a disallowed model and filter `/v1/models` responses to show only allowed models. An empty list means all models on the upstream backend(s) are permitted.
- Whether Open WebUI header support is enabled (see [Open WebUI Integration](portal-and-gateway.md#open-webui-integration))
- Backend profiles are created and managed via the admin portal
- Profiles can optionally be pre-defined in `config.yaml` — these are automatically populated into the database on startup and are **read-only** in the admin portal (cannot be edited or deleted via the UI)
- Admin-created profiles (not from config) can be freely edited and deleted

## Policies

Policies define terms of use that users must accept before they can create API keys for a backend profile. Policies are assigned to backend profiles, and a backend profile can have one or more policies.

### Policy Definitions

- Policies have a name, description, and policy content (the text users must accept)
- Policies can be created and managed via the admin portal, or pre-defined in `config.yaml`
- Config-defined policies are automatically populated into the database on startup and are **read-only** in the admin portal (cannot be edited or deleted via the UI)
- Admin-created policies (not from config) can be freely edited and deleted

### Policy Versioning

- Every policy has a version history stored in the database
- Each version records the policy content and a timestamp of when the version was created
- Any change to a policy (admin-edited or config-defined) creates a new version automatically
- Previous versions are retained and can be looked up

### Policy Acceptance

- Users must accept all policies assigned to a backend profile before they can use it to create API keys
- When a user accepts a policy, the acceptance record stores:
  - The specific policy version that was accepted (this can then be used to record accepted policies against generated API keys)
  - The backend profile the acceptance applies to
  - The timestamp of acceptance
- Acceptance is scoped to a backend profile — accepting a policy for one profile does not satisfy the same policy on another profile

### Policy Change Enforcement

- Admin-created policies have an option to **enforce reacceptance on change** — when this is enabled and the policy content is updated:
  - All backend profiles with that policy assigned are **paused** for each user (existing API keys will function, new API keys cannot be created)
  - Users must reaccept the updated policy before the backend profile is usable for them again (reenable API key generation)
- Config-defined policies **do not support** the reacceptance enforcement option (it is always disabled)
- When reacceptance is not enforced, policy updates do not interrupt access — a new version is still created for audit purposes, but existing acceptances remain valid

## OpenAI Backends

OpenAI backends represent individual upstream inference endpoints:

- Name, base URL, and API key for the upstream service
- Created and managed via the admin portal
- Backends can optionally be pre-defined in `config.yaml` — these are automatically populated into the database on startup and are **read-only** in the admin portal (cannot be edited or deleted via the UI)
- Admin-created backends (not from config) can be freely edited and deleted

## User Portal

- Users can view and accept policies for backend profiles they have access to
- Users can view records of policies they have accepted (policy name, policy version, backend profile, acceptance timestamp)
- Users are prompted to reaccept policies when a new version is published and reacceptance is enforced
- Users can see connection status, metrics, and quota usage for their available backends and backend profiles
- User interactions with the portal create log events in the Flask app's stdout

## API Key Management

See [API Key Management](portal-and-gateway.md#api-key-management) for the full user flow.

**Key creation:**

- Key name
- Backend profile selection
- Expiry date (default or enforced from backend profile config)
- Opt-in to VSCode Continue config template generation
- Opt-in to Open WebUI header support (only shown if enabled on the selected backend profile)
- The accepted policy versions for the selected backend profile at creation time are recorded against the API key

**Key editing:**

- View API key value
- Edit VSCode Continue config template opt-in
- Edit Open WebUI header support opt-in
- View usage metrics
- View quota usage
- View accepted policy versions

**Key management:**

- User can revoke their own API keys
- Admin can revoke any API key — records which admin performed the revocation
- Admin can restore revoked API keys (expired keys cannot be restored)
- Template VSCode Continue config for all opted-in API keys

## Monitoring & Quotas

See [Monitoring & Quotas](portal-and-gateway.md#monitoring-quotas) for full details.

### Prometheus Metrics Labels

All metrics carry the labels: `user`, `api_key`, `backend_profile`, `openai_backend`, `model`

### Metric Types

- Token usage
- API call latency
- API call success/failure
- Daily active unique API users (Gasket users)
- Daily active unique API users (Open WebUI users)
- Daily active unique API users (all users)
- Daily active unique Gasket Portal users

## Audit

See [Audit](portal-and-gateway.md#audit) for full details.

- Audit records written to OpenSearch
- Audit record contains: user, api_key, model, backend, timestamps, token counts
- Full request/response content audit per backend profile (optional)
- Related requests aggregated (e.g. streaming chunks)

## Open WebUI Header Support

See [Open WebUI Integration](portal-and-gateway.md#open-webui-integration) for full details.

- Backend profiles can opt-in to trusting Open WebUI user identity headers
- When enabled on the profile, users must also opt-in per API key
- If both opts are active and headers are present: include Open WebUI identity in audit records and quota evaluation
- If headers are absent, fall back to Gasket user identity only

## Admin Panel

See [Admin Panel](portal-and-gateway.md#admin-panel) for full details.

- Connection status for: PostgreSQL, OIDC provider, OpenSearch, all OpenAI backends
- **OpenAI backend management:** add, edit, and delete backends (config-defined backends are read-only)
- **Backend profile management:** create, edit, and delete profiles with associated backends and policies (config-defined profiles are read-only)
- **Policy management:** create, edit, and delete policies; assign policies to backend profiles; configure reacceptance enforcement (config-defined policies are read-only)
- View policy version history
- List all API keys with usage metrics/quotas and active block statuses, accepted policies that apply to each key
- Revoke and restore any API key
- Filter and search API keys
- Fetch and view audit records from OpenSearch
- Usage metrics dashboard from PostgreSQL
- Usage quotas dashboard including current block statuses
- OpenAI backend dashboard showing connection status and usage metrics
- Backend profile dashboard showing usage metrics and quotas
- Policy acceptance records with search/filter by Gasket user, including accepted policy version details

## API Proxy

- The proxy listens on `:5000/v1/*`, matching the OpenAI API path convention
- Incoming requests must include an `Authorization: Bearer gsk_*` header containing a valid Gasket API key
- The proxy validates the API key (active, not revoked, not expired), resolves the user, backend profile, and upstream backend(s)
- When multiple backends are available, routing should implement sticky sessions based on chat session to preserve upstream cache context (needs further research)
- Requests are forwarded to the upstream backend(s) with the upstream backend's own API key
- Streaming responses (`stream: true`) are proxied as Server-Sent Events back to the client
- Upstream errors (timeouts, 5xx, connection failures) are returned as OpenAI-compatible error JSON responses
- Token counts from upstream responses are extracted for audit, metrics, and quota evaluation
- When a backend profile has an allowed models list configured, the proxy must enforce it:
  - `/v1/models` responses are filtered to include only allowed models
  - Requests to `/v1/chat/completions`, `/v1/completions`, and other model-bearing endpoints are rejected with a 403 if the requested model is not in the allowed list
