# Project Requirements

Full functional requirements for the Gasket Gateway.

## Application

- Python Flask application (Exposed on default port `5000` and metrics port `9050`)
- Supports multiple concurrent instances (high availability) sharing the same PostgreSQL and OpenSearch, with OIDC session state persisted across instances
- UI built with plain HTML, CSS, and JavaScript — no external UI libraries or JavaScript frameworks
- `:5000/health` endpoint returning 200 OK
- `:9050/health` endpoint returning 200 OK
- `:9050/metrics` endpoint returning Prometheus metrics, aggregated across all instances via PostgreSQL (uses different port `9050` to isolate from main traffic)

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
- Policy text for users to accept before use
- Whether metadata audit is enabled
- Whether full request/response content audit is enabled
- List of OpenAI backends
- Default or enforced API key expiry duration
- Usage quota configurations (see [Monitoring & Quotas](quotas.md))
- Maximum number of active API keys per user
- Whether Open WebUI header support is enabled (see [Open WebUI Integration](open-webui.md))
- Backend profiles are created and managed via the admin portal

## OpenAI Backends

OpenAI backends represent individual upstream inference endpoints:

- Name, base URL, and API key for the upstream service
- Created and managed via the admin portal
- Backends can optionally be pre-defined in `config.yaml` — these are automatically populated into the database on startup and are **read-only** in the admin portal (cannot be edited or deleted via the UI)
- Admin-created backends (not from config) can be freely edited and deleted

## User Portal

- Users can view and accept policies for backend profiles they have access to
- Users can view records of policies they have accepted (policy, acceptance timestamp)
- Users can see connection status, metrics, and quota usage for their available backends and backend profiles
- User interactions with the portal create log events in the Flask app's stdout

## API Key Management

See [API Key Management](api-keys.md) for the full user flow.

**Key creation:**

- Key name
- Backend profile selection
- Expiry date (default or enforced from backend profile config)
- Opt-in to VSCode Continue config template generation
- Opt-in to Open WebUI header support (only shown if enabled on the selected backend profile)

**Key editing:**

- View API key value
- Edit VSCode Continue config template opt-in
- Edit Open WebUI header support opt-in
- View usage metrics
- View quota usage

**Key management:**

- User can revoke their own API keys
- Template VSCode Continue config for all opted-in API keys

## Monitoring & Quotas

See [Monitoring & Quotas](quotas.md) for full details.

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

See [Audit](audit.md) for full details.

- Audit records written to OpenSearch
- Audit record contains: user, api_key, model, backend, timestamps, token counts
- Full request/response content audit per backend profile (optional)
- Related requests aggregated (e.g. streaming chunks)

## Open WebUI Header Support

See [Open WebUI Integration](open-webui.md) for full details.

- Backend profiles can opt-in to trusting Open WebUI user identity headers
- When enabled on the profile, users must also opt-in per API key
- If both opts are active and headers are present: include Open WebUI identity in audit records and quota evaluation
- If headers are absent, fall back to Gasket user identity only

## Admin Panel

See [Admin Panel](admin.md) for full details.

- Connection status for: PostgreSQL, OIDC provider, OpenSearch, all OpenAI backends
- **OpenAI backend management:** add, edit, and delete backends (config-defined backends are read-only)
- **Backend profile management:** create, edit, and delete profiles with associated backends and policies
- List all API keys with usage metrics/quotas and active block statuses
- Revoke and restore any API key
- Filter and search API keys
- Fetch and view audit records from OpenSearch
- Usage metrics dashboard from PostgreSQL
- Usage quotas dashboard including current block statuses
- OpenAI backend dashboard showing connection status and usage metrics
- Backend profile dashboard showing usage metrics and quotas
- Policy acceptance records with search/filter by Gasket user
