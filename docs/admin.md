# Admin Panel

The Gasket Admin Panel is accessible to users who belong to the configured admin OIDC group.

## System Status

Connection status indicators for all dependencies:

| Dependency    | Status shown      |
| ------------- | ----------------- |
| PostgreSQL    | Connected / Error |
| OIDC Provider | Connected / Error |
| OpenSearch    | Connected / Error |

## OpenAI Backends

Manage OpenAI-compliant inference backends:

- **List** all backends with connection status, base URL, API key, and TLS verification
- **Add** new backends via the admin portal
- **Edit** admin-created backends (name, URL, API key, TLS settings)
- **Delete** admin-created backends
- **Test** backend connectivity from the admin panel
- Config-defined backends appear with a **config** badge and are read-only

## Backend Profiles

Manage backend profiles that define access rules:

- **List** all profiles with OIDC groups, linked backends, linked policies, audit settings, and key limits
- **Add** new profiles with linked backends, policies, OIDC groups, and settings
- **Edit** admin-created profiles (all fields including backend and policy assignments)
- **Delete** admin-created profiles
- Config-defined profiles appear with a **config** badge and are read-only

## Policies

Manage policies that gate API key creation:

- **List** all policies with name, description, source, current version, reacceptance status, and linked profiles
- **Add** new policies with name, description, content, and optional reacceptance enforcement
- **Edit** admin-created policies — updating content automatically creates a new version
- **Delete** admin-created policies (removes all versions and acceptance records)
- **View version history** for any policy
- Config-defined policies appear with a **config** badge and are read-only
- Policies with **reacceptance enforcement** enabled show a warning badge

### Acceptance Records

Below the policies table, admins can view all policy acceptance records:

- User email, policy name, version number, backend profile, and acceptance timestamp
- **Filter by user email** with debounced search
- Shows the full acceptance audit trail across all users and profiles

## API Key Management

View and manage all API keys across all users:

- **Table view** showing user email, key name, masked preview (`gsk_…xxxx`), profile, status, expiry, and creation date
- **Filter** by user email (debounced search) and backend profile (dropdown)
- **Revoke** any active API key — records which admin performed the revocation
- **Restore** any revoked API key — disabled for expired keys (expired keys cannot be restored)
- **View policy snapshots** — modal showing the exact policy versions accepted when the key was created

!!! note "Key masking"
    Admin routes never expose full API key values — only the masked preview is shown. Only the key owner can reveal the full value from the Portal.

## Audit Records

Search and view audit records from OpenSearch:

- **Search and filter** — adjust OpenSearch queries by user, key, model, backend, or time range
- **Metadata view** — request metadata (user, timestamps, token counts, backend)
- **Full content view** — full request/response content (where enabled on the backend profile)
- **Conversation threads** — aggregate related requests into conversation views
- **Histograms** — request/response count and token usage over time

## Dashboards

### Usage Metrics

Prometheus-backed dashboard showing aggregate token usage, latency, and success/failure rates.

### Usage Quotas

Current quota consumption and active block statuses from Prometheus and the database.

### OpenAI Backends

Connection status and per-backend usage metrics for all configured OpenAI backends.

### Backend Profiles

Usage metrics and quota status broken down by backend profile.
