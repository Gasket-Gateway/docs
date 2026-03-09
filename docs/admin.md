# Admin Panel

The Gasket Admin Panel is accessible to users who belong to the configured admin OIDC group.

## System Status

Connection status indicators for all dependencies:

| Dependency    | Status shown      |
| ------------- | ----------------- |
| PostgreSQL    | Connected / Error |
| OIDC Provider | Connected / Error |
| OpenSearch    | Connected / Error |
| Prometheus    | Connected / Error |

## API Key Management

- List all API keys across all users with:
  - Usage metrics from Prometheus
  - Quota usage from Prometheus
  - Active block statuses from the database
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

## Policy Acceptance Records

View a full log of policy acceptances across all users:

- Which policy was accepted
- When it was accepted
- Filter and search by Gasket user
