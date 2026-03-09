# API Key Management

Users create and manage Gasket API keys through the Portal UI. Each key is scoped to a **backend profile** and carries optional feature opt-ins.

## Creating an API Key

When creating a new key, users provide:

| Field                  | Description                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| **Key name**           | A label to identify the key                                                                |
| **Backend profile**    | Which backend profile this key will access                                                 |
| **Expiry date**        | Default or enforced from the backend profile config                                        |
| **VSCode Continue**    | Opt-in to generate a Continue extension config snippet                                     |
| **Open WebUI headers** | Opt-in to trust Open WebUI identity headers (only shown if enabled on the backend profile) |

## Viewing & Editing Keys

From the key list, users can:

- **View** the API key value
- **Edit** the VSCode Continue config opt-in
- **Edit** the Open WebUI header support opt-in
- **View** token usage metrics from Prometheus
- **View** quota usage from Prometheus

## Revoking Keys

Users can revoke any of their own keys at any time. Admins can revoke any key from the [Admin Panel](admin.md).

## VSCode Continue Integration

For any API key with the Continue opt-in enabled, Gasket generates a ready-to-use VSCode Continue extension config snippet. This snippet can be copied directly into the user's Continue configuration.

!!! tip
The Continue config snippet is visible on the key detail page. It points at the Gasket gateway endpoint and includes the API key pre-filled.

## Open WebUI Integration

If a backend profile has Open WebUI header support enabled, users can additionally opt a key into this feature. See [Open WebUI Integration](open-webui.md) for how this affects metrics and quotas.
