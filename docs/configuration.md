# Configuration Reference

Gasket Gateway is configured via a single `config.yaml` file, typically mounted at `/etc/gasket/config.yaml` inside the container. Override the path with the `GASKET_CONFIG` environment variable.

---

## `server`

Controls the Flask web server and internal metrics endpoint.

| Key            | Type    | Default   | Description                                 |
| -------------- | ------- | --------- | ------------------------------------------- |
| `host`         | string  | `0.0.0.0` | Bind address for the web server             |
| `port`         | integer | `5000`    | HTTP port for the portal                    |
| `metrics_port` | integer | `9050`    | Port for the Prometheus `/metrics` endpoint |
| `debug`        | boolean | `false`   | Enable Flask debug mode (development only)  |

```yaml
server:
  host: "0.0.0.0"
  port: 5000
  metrics_port: 9050
  debug: false
```

---

## `default_theme`

Sets the initial UI colour scheme. Users can toggle the theme from the navbar.

| Value   | Description            |
| ------- | ---------------------- |
| `light` | Light background theme |
| `dark`  | Dark background theme  |

```yaml
default_theme: "dark"
```

---

## `banners`

A list of portal banners rendered in array order. Each banner supports HTML content and can be positioned in one of four locations.

| Key          | Type   | Default        | Description                                            |
| ------------ | ------ | -------------- | ------------------------------------------------------ |
| `type`       | string | `info`         | Colour theme: `info`, `success`, `warning`, `error`, or `outline` |
| `content`    | string | —              | Banner text (HTML supported, e.g. `<b>bold</b>`)       |
| `position`   | string | `above_navbar` | Where the banner appears (see positions below)         |
| `visibility` | list   | _(all)_        | Who can see the banner (see visibility below)          |

**Position options:**

| Position           | Behaviour                                                    |
| ------------------ | ------------------------------------------------------------ |
| `above_navbar`     | Part of the sticky header — stays visible when scrolling     |
| `below_navbar`     | Below the header in normal flow — scrolls away with the page |
| `footer`           | Bottom of the page — must scroll down to see it              |
| `permanent_footer` | Fixed to the bottom of the viewport — always visible         |

**Visibility options** (omit to show to everyone):

| Value       | Description                                          |
| ----------- | ---------------------------------------------------- |
| `anonymous` | Visitors who are not logged in (e.g. the login page) |
| `user`      | Authenticated users (admins also see these)          |
| `admin`     | Admin users only                                     |

To disable banners entirely, set `banners` to an empty list (`banners: []`).

```yaml
banners:
  - type: info
    content: "ℹ️ Welcome to the <b>Gasket Gateway</b> dev environment."
    position: above_navbar
  - type: warning
    content: "⚠️ Scheduled maintenance on <b>Saturday 22 Mar</b>."
    position: below_navbar
    visibility: [user, admin]
  - type: error
    content: "🚫 Service degraded — check admin panel."
    position: permanent_footer
    visibility: [admin]
```

!!! note "Banner types"
    - **info** — blue tint, for general announcements
    - **success** — green tint, for positive status messages
    - **warning** — amber tint, for upcoming changes or degraded state
    - **error** — red tint, for outages or critical issues
    - **outline** — no colour tint, follows the current light/dark theme

---

## `oidc`

OpenID Connect authentication settings. Gasket authenticates users via an OIDC provider (e.g. Authentik) and maps OIDC group memberships to portal roles.

| Key                     | Type    | Default         | Description                                                                                  |
| ----------------------- | ------- | --------------- | -------------------------------------------------------------------------------------------- |
| `provider_url`          | string  | —               | OIDC discovery base URL (must expose `.well-known/openid-configuration`)                     |
| `client_id`             | string  | —               | OAuth2 client ID registered with the provider                                                |
| `client_secret`         | string  | —               | OAuth2 client secret                                                                         |
| `skip_tls_verify`       | boolean | `false`         | Skip TLS certificate verification (dev only)                                                 |
| `session_timeout_hours` | integer | `8`             | Hours before an authenticated session expires                                                |
| `redirect_url`          | string  | _(auto)_        | Explicit callback URL sent to the OIDC provider. Falls back to Flask-generated URL if unset. |
| `logout_url`            | string  | `/`             | URL to redirect to after logout (typically the provider's end-session endpoint)              |
| `groups.user_access`    | string  | `gasket-users`  | OIDC group required for basic portal access                                                  |
| `groups.admin_access`   | string  | `gasket-admins` | OIDC group required for admin panel access                                                   |

```yaml
oidc:
  provider_url: "https://authentik.example.com/application/o/gasket-gateway/"
  client_id: "my-client-id"
  client_secret: "my-client-secret"
  skip_tls_verify: false
  session_timeout_hours: 8
  redirect_url: "https://portal.example.com/auth/callback"
  logout_url: "https://authentik.example.com/application/o/gasket-gateway/end-session/"
  groups:
    user_access: "gasket-users"
    admin_access: "gasket-admins"
```

!!! warning "TLS verification"
    Only set `skip_tls_verify: true` in development environments with self-signed certificates. Never disable in production.

---

## `database`

PostgreSQL connection settings for persistent storage (API keys, user data, etc.).

| Key        | Type    | Default     | Description       |
| ---------- | ------- | ----------- | ----------------- |
| `host`     | string  | `localhost` | Database hostname |
| `port`     | integer | `5432`      | Database port     |
| `name`     | string  | `gasket`    | Database name     |
| `user`     | string  | `gasket`    | Database user     |
| `password` | string  | —           | Database password |

```yaml
database:
  host: "postgres"
  port: 5432
  name: "gasket"
  user: "gasket"
  password: "my-secure-password"
```

---

## `opensearch`

OpenSearch connection for audit record storage and retrieval.

| Key               | Type    | Default                 | Description                       |
| ----------------- | ------- | ----------------------- | --------------------------------- |
| `url`             | string  | `http://localhost:9200` | OpenSearch endpoint URL           |
| `skip_tls_verify` | boolean | `false`                 | Skip TLS certificate verification |

```yaml
opensearch:
  url: "http://opensearch.example.com:9200"
  skip_tls_verify: false
```

---

## `openai_backends`

A list of OpenAI-compliant backend definitions. Config-defined backends are automatically synced to the database on startup and are **read-only** in the admin portal. Additional backends can be created via the admin portal.

| Key               | Type    | Default | Description                                          |
| ----------------- | ------- | ------- | ---------------------------------------------------- |
| `name`            | string  | —       | Unique name for the backend                          |
| `base_url`        | string  | —       | Base URL of the OpenAI-compliant API                 |
| `api_key`         | string  | `""`    | API key for authenticating with the upstream backend |
| `skip_tls_verify` | boolean | `false` | Skip TLS certificate verification                    |

```yaml
openai_backends:
  - name: "ollama-internal"
    base_url: "https://ollama.example.com"
    api_key: ""
    skip_tls_verify: false
  - name: "openai-production"
    base_url: "https://api.openai.com/v1"
    api_key: "sk-..."
    skip_tls_verify: false
```

!!! info "Config vs admin backends"
    Config-defined backends appear with a **config** badge in the admin panel and cannot be edited or deleted through the UI. Admin-created backends can be freely modified.

---

## `policies`

A list of policy definitions. Policies define terms of use that users must accept before creating API keys for backend profiles that reference them.

Config-defined policies are automatically synced to the database on startup and are **read-only** in the admin portal. Additional policies can be created via the admin portal.

| Key                      | Type    | Default | Description                                                      |
| ------------------------ | ------- | ------- | ---------------------------------------------------------------- |
| `name`                   | string  | —       | Unique name for the policy                                       |
| `description`            | string  | `""`    | Internal description for admins                                  |
| `content`                | string  | —       | The policy text displayed to users                               |

```yaml
policies:
  - name: "acceptable-use"
    description: "Standard acceptable use policy for internal services"
    content: |
      You must use this service responsibly and in accordance with
      organisational guidelines. Do not share API keys with
      unauthorised users. All usage is subject to audit logging.
```

!!! info "Config vs admin policies"
    Config-defined policies always have **reacceptance enforcement disabled** — updating the content in `config.yaml` will create a new version but won't invalidate existing user acceptances. Admin-created policies can optionally enable reacceptance enforcement via the admin panel.

### Versioning

Every policy maintains an immutable version history. When policy content changes (either by editing in the admin panel or updating `config.yaml`), a new version is created automatically. Previous versions are retained for audit purposes.

### Acceptance

Users must accept all policies assigned to a backend profile before they can create API keys. Acceptance is scoped to a specific backend profile — accepting a policy for one profile does not satisfy it for another.

### Reacceptance Enforcement

Admin-created policies can enable **reacceptance enforcement**. When enabled, updating the policy content will:

1. Invalidate all existing acceptances for that policy
2. Prevent users from creating new API keys for affected profiles until they reaccept

This does not affect existing API keys — only the creation of new ones.

---

## `backend_profiles`

A list of backend profile definitions. Each profile groups one or more backends with access controls, policies, audit settings, and quotas.

Config-defined profiles are automatically synced to the database on startup and are **read-only** in the admin portal. Additional profiles can be created via the admin portal.

| Key                  | Type    | Default | Description                                                                    |
| -------------------- | ------- | ------- | ------------------------------------------------------------------------------ |
| `name`               | string  | —       | Unique name for the profile                                                    |
| `description`        | string  | `""`    | Internal description for admins                                                |
| `oidc_groups`        | list    | `[]`    | OIDC groups required for access (users must belong to at least one)            |
| `backends`           | list    | `[]`    | List of backend names (must match `openai_backends` entries)                   |
| `policy_names`       | list    | `[]`    | List of policy names (must match `policies` entries)                           |
| `metadata_audit`     | boolean | `true`  | Enable audit logging of request metadata                                       |
| `content_audit`      | boolean | `false` | Enable audit logging of full request/response content                          |
| `default_expiry_days`| integer | _(none)_| Default API key expiry in days (null for no default)                           |
| `enforce_expiry`     | boolean | `false` | Enforce the expiry — users cannot extend beyond the configured duration        |
| `max_keys_per_user`  | integer | `5`     | Maximum number of active API keys per user                                     |
| `open_webui_enabled` | boolean | `false` | Enable Open WebUI header support for this profile                              |

```yaml
backend_profiles:
  - name: "internal-standard"
    description: "Standard access to the internal Ollama instance"
    oidc_groups:
      - "gasket-users"
    backends:
      - "ollama-internal"
    policy_names:
      - "acceptable-use"
    metadata_audit: true
    content_audit: false
    max_keys_per_user: 5
  - name: "power-user"
    description: "Extended access with content auditing"
    oidc_groups:
      - "gasket-power-users"
    backends:
      - "ollama-internal"
      - "openai-production"
    policy_names:
      - "acceptable-use"
    metadata_audit: true
    content_audit: true
    default_expiry_days: 90
    enforce_expiry: true
    max_keys_per_user: 10
    open_webui_enabled: true
```

!!! info "Config vs admin profiles"
    Config-defined profiles appear with a **config** badge in the admin panel and cannot be edited or deleted through the UI. Admin-created profiles can be freely modified. Both types reference backends and policies by name.

---

## Full Example

```yaml
server:
  host: "0.0.0.0"
  port: 5000
  metrics_port: 9050
  debug: false

default_theme: "dark"

banners:
  - type: info
    content: "ℹ️ Welcome to the <b>Gasket Gateway</b>."
    position: above_navbar

oidc:
  provider_url: "https://authentik.example.com/application/o/gasket-gateway/"
  client_id: "my-client-id"
  client_secret: "my-client-secret"
  skip_tls_verify: false
  session_timeout_hours: 8
  redirect_url: "https://portal.example.com/auth/callback"
  logout_url: "https://authentik.example.com/application/o/gasket-gateway/end-session/"
  groups:
    user_access: "gasket-users"
    admin_access: "gasket-admins"

database:
  host: "postgres"
  port: 5432
  name: "gasket"
  user: "gasket"
  password: "my-secure-password"

opensearch:
  url: "http://opensearch.example.com:9200"
  skip_tls_verify: false

openai_backends:
  - name: "ollama-internal"
    base_url: "https://ollama.example.com"
    api_key: ""
    skip_tls_verify: false

policies:
  - name: "acceptable-use"
    description: "Standard acceptable use policy"
    content: |
      You must use this service responsibly and in accordance
      with organisational guidelines.

backend_profiles:
  - name: "internal-standard"
    description: "Standard access to the internal Ollama instance"
    oidc_groups:
      - "gasket-users"
    backends:
      - "ollama-internal"
    policy_names:
      - "acceptable-use"
    metadata_audit: true
    content_audit: false
    max_keys_per_user: 5
```
