# Admin Panel

The Gasket Admin Panel is accessible to users who belong to the configured admin OIDC group. The admin panel is organised into individual pages, each accessible from the admin sidebar navigation.

Navigating to `/admin` redirects to the default page (`/admin/status`).

## Pages

| Route              | Page              | Status      |
| ------------------ | ----------------- | ----------- |
| `/admin/status`    | Connection Status | Available   |
| `/admin/backends`  | OpenAI Backends   | Available   |
| `/admin/profiles`  | Backend Profiles  | Available   |
| `/admin/policies`  | Policies          | Available   |
| `/admin/keys`      | API Keys          | Available   |
| `/admin/audit`     | Audit Records     | Placeholder |
| `/admin/usage`     | Usage Metrics     | Placeholder |
| `/admin/quotas`    | Quotas            | Placeholder |

---

## Connection Status (`/admin/status`)

Connection status indicators for all dependencies:

| Dependency    | Status shown      |
| ------------- | ----------------- |
| PostgreSQL    | Connected / Error |
| OIDC Provider | Connected / Error |
| OpenSearch    | Connected / Error |

---

## OpenAI Backends (`/admin/backends`)

Manage OpenAI-compliant inference backends:

- **List** all backends with connection status, base URL, API key, and TLS verification
- **Add** new backends via the admin portal
- **Edit** admin-created backends (name, URL, API key, TLS settings)
- **Delete** admin-created backends
- **Test** backend connectivity from the admin panel
- Config-defined backends appear with a **config** badge and are read-only

---

## Backend Profiles (`/admin/profiles`)

Manage backend profiles that define access rules:

- **List** all profiles with OIDC groups, linked backends, linked policies, audit settings, and key limits
- **Add** new profiles with linked backends, policies, OIDC groups, and settings
- **Edit** admin-created profiles (all fields including backend and policy assignments)
- **Delete** admin-created profiles
- Config-defined profiles appear with a **config** badge and are read-only

---

## Policies (`/admin/policies`)

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

---

## API Keys (`/admin/keys`)

View and manage all API keys across all users:

- **Table view** showing user email, key name, masked preview (`gsk_…xxxx`), profile, status, expiry, and creation date
- **Filter** by user email (debounced search) and backend profile (dropdown)
- **Revoke** any active API key — records which admin performed the revocation
- **Restore** any revoked API key — disabled for expired keys (expired keys cannot be restored)
- **View policy snapshots** — modal showing the exact policy versions accepted when the key was created

!!! note "Key masking"
    Admin routes never expose full API key values — only the masked preview is shown. Only the key owner can reveal the full value from the Portal.

---

## Audit Records (`/admin/audit`)

!!! info "Coming soon"
    This page is a placeholder for upcoming audit record search and viewing functionality.

Search and view audit records from OpenSearch:

- **Search and filter** — adjust OpenSearch queries by user, key, model, backend, or time range
- **Metadata view** — request metadata (user, timestamps, token counts, backend)
- **Full content view** — full request/response content (where enabled on the backend profile)
- **Conversation threads** — aggregate related requests into conversation views
- **Histograms** — request/response count and token usage over time

---

## Usage Metrics (`/admin/usage`)

!!! info "Coming soon"
    This page is a placeholder for upcoming usage metrics dashboard functionality.

Prometheus-backed dashboard showing aggregate token usage, latency, and success/failure rates.

---

## Quotas (`/admin/quotas`)

!!! info "Coming soon"
    This page is a placeholder for upcoming quota management functionality.

Current quota consumption and active block statuses from Prometheus and the database.


# API Key Management

Users create and manage Gasket API keys through the Portal UI at `/keys`. Each key is scoped to a **backend profile** and carries optional feature opt-ins.

## Key Format

API keys use the format `gsk_<48 hex chars>` (e.g. `gsk_a3b2c1d4e5f6…`). The full key value is stored securely in the database and can be revealed by the owning user at any time. Admin routes only display a masked preview (`gsk_…xxxx`).

## Creating an API Key

Before creating a key, users must **accept all policies** assigned to the selected backend profile. The portal shows pending policies with a "Review & Accept" button — once all are accepted, key creation is enabled.

!!! info "Policy gating"
    If a policy with reacceptance enforcement is updated after the user has already accepted it, the user must reaccept the new version before they can create additional API keys for that profile. Existing keys are not affected.

When creating a new key, users provide:

| Field                  | Description                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| **Key name**           | A label to identify the key                                                                |
| **Backend profile**    | Which backend profile this key will access (only profiles with all policies accepted)      |
| **Expiry date**        | Optional — defaults from the backend profile config, or no expiry if not configured        |
| **VSCode Continue**    | Opt-in to enable Continue extension integration                                            |
| **Open WebUI headers** | Opt-in to trust Open WebUI identity headers (only shown if enabled on the backend profile) |

The accepted policy versions at the time of key creation are recorded as **policy snapshots** against the API key for audit purposes. A maximum number of active keys per user per profile is enforced by the backend profile configuration.

## Viewing & Revealing Keys

From the portal key list, each key is displayed as a card showing:

- Name, status badge (Active / Revoked / Expired), and feature badges (VSCode / WebUI)
- Masked key preview (`gsk_…xxxx`)
- Profile name, creation date, and expiry date

Users can:

- **Reveal** the full key value via the 👁 Reveal button, with a copy-to-clipboard option
- **Edit** the VSCode Continue and Open WebUI opt-in toggles
- **View** key details including profile, status, and timestamps

## Revoking Keys

Users can revoke any of their own keys at any time via a confirmation dialog. Revoked keys:

- Immediately stop working for API access
- Show who revoked the key and when
- Display a note advising users to contact an administrator if they need the key restored
- Do **not** count towards the max keys per user limit

Admins can revoke any key from the [Admin Panel](#admin-panel). Admins can also **restore** revoked keys, but **expired keys cannot be restored**.

## VSCode Continue Integration

For any API key with the Continue opt-in enabled, Gasket generates a ready-to-use VSCode Continue extension config snippet. This snippet can be copied directly into the user's Continue configuration.

!!! info "Coming soon"
    This feature is currently planned on the roadmap. Once built, the Continue config snippet will be visible on the key detail page.

## Open WebUI Integration

If a backend profile has Open WebUI header support enabled, users can additionally opt a key into this feature. See [Open WebUI Integration](#open-webui-integration) for how this affects metrics and quotas.


# Monitoring & Quotas

Gasket provides metrics for token usage and enforces configurable quotas per backend profile.

## Metrics

All metrics carry the following labels:

| Label             | Description                 |
| ----------------- | --------------------------- |
| `user`            | Gasket user identity        |
| `api_key`         | API key identifier          |
| `backend_profile` | Backend profile name        |
| `openai_backend`  | Specific OpenAI backend URL |
| `model`           | Model name from the request |

### Metric Types

| Metric                                     | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| Token usage                                | Prompt and completion token counts per request |
| API call latency                           | Request duration in milliseconds               |
| API call success/failure                   | Success and error counters                     |
| Daily active unique API users (Gasket)     | Distinct Gasket users per day                  |
| Daily active unique API users (Open WebUI) | Distinct Open WebUI users per day              |
| Daily active unique API users (all)        | Combined distinct users per day                |
| Daily active unique Gasket Portal users    | Distinct portal logins per day                 |

## Quota Configuration

Quotas are configured per **backend profile** and define a maximum number of tokens allowed within a rolling time period (e.g. 10,000 tokens per 24 hours).

### Quota Scopes

| Scope                                   | Description                                               |
| --------------------------------------- | --------------------------------------------------------- |
| Per API key                             | Limits token usage for a single API key                   |
| Per Gasket user per backend profile     | Limits a user across all their keys on a profile          |
| Per Open WebUI user per backend profile | Limits an Open WebUI identity across a profile            |
| Per Gasket user globally                | Limits a user across all backend profiles                 |
| Per Open WebUI user globally            | Limits an Open WebUI identity across all backend profiles |

## Quota Enforcement Flow

```
Incoming request
      │
      ▼
Check database for active block status
      │
      ├─ Blocked? ──► Reject request (429)
      │
      ▼
Proxy request to backend
      │
      ▼
Allow response through
      │
      +-trigger background task-+
                                |
                                ▼
                  Query to evaluate quota consumption
                        │
                        ├─ Quota exceeded? ──► Write block status + expiry to database
```

## Block Status

When a quota is exceeded:

1. A block status and expiry timestamp are written to the PostgreSQL database for the relevant user/key/scope.
2. On every subsequent incoming request, the block status is checked **before** proxying.
3. Once the block expires, requests flow through normally.


# Audit

Gasket writes audit records to OpenSearch for every proxied request.

## Audit Fields

Every audit record includes:

| Field          | Description                        |
| -------------- | ---------------------------------- |
| `user`         | Gasket user identity               |
| `api_key`      | API key identifier                 |
| `model`        | Model name from the request        |
| `backend`      | Specific OpenAI backend URL        |
| `timestamps`   | Request start and end times        |
| `token_counts` | Prompt and completion token counts |

## Full Content Audit

Backend profiles can optionally enable **full request/response content audit**. When enabled:

- The complete request body is stored in the audit record
- The complete response body is stored (including assembled streaming content)
- This can be toggled independently of metadata audit

!!! warning "Storage Considerations"
Full content audit can significantly increase OpenSearch storage usage. Enable only for profiles that require it for compliance or debugging.

## Streaming Request Aggregation

For streaming responses (e.g. `stream: true`), Gasket aggregates the individual streamed chunks into a single audit record. This ensures audit records represent complete conversation turns rather than individual SSE events.

## Searching Audit Records

The [Admin Panel](#admin-panel) provides a search and filter interface over OpenSearch audit records, with support for:

- Keyword search across metadata fields
- Filtering by user, API key, backend, model, or time range
- Metadata-only view or full content view
- Request/response histograms showing usage over time
- Aggregated conversation thread view


# Open WebUI Integration

Gasket supports trusting user identity headers injected by Open WebUI, enabling per-Open-WebUI-user metrics, quotas, and audit records.

## How It Works

Open WebUI injects HTTP headers identifying the logged-in Open WebUI user. Gasket can read these headers and use the contained identity for:

- Audit record attribution
- Prometheus metric labels
- Quota evaluation

!!! warning "Security Consideration"
Because these headers can be spoofed by any API client, this feature must be explicitly enabled at two levels: the backend profile and the individual API key. Never enable this unless your API key distribution is sufficiently controlled.

## Enabling Open WebUI Header Support

### 1. Backend Profile

The backend profile must have Open WebUI header support enabled in the configuration. This is set by an administrator.

### 2. API Key

When creating or editing an API key, users are shown the Open WebUI header opt-in **only if it is enabled on the selected backend profile**. The user must also opt in on the key.

Both conditions must be satisfied for the feature to be active.

## Behaviour When Active

When the backend profile and API key both have the opt-in enabled:

| Headers present? | Behaviour                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Yes              | Open WebUI identity used for audit, metrics, and quota evaluation (in addition to the Gasket user) |
| No               | Falls back to Gasket user identity only                                                            |

## Quota Scopes

When Open WebUI header support is active, quota scopes include Open WebUI-specific dimensions:

- Per Open WebUI user per backend profile
- Per Open WebUI user globally

See [Monitoring & Quotas](#monitoring-quotas) for the full list of quota scopes.


