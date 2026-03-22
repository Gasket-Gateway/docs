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
