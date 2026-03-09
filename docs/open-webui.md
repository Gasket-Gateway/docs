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

See [Monitoring & Quotas](quotas.md) for the full list of quota scopes.
