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

- List all API keys across all users with:
  - Usage metrics from Prometheus
  - Quota usage from Prometheus
  - Active block statuses from the database
  - Accepted policy versions
- **Revoke** any active API key
- **Restore** any previously revoked API key
- Filter and search keys by user, backend profile, status, or key name

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
