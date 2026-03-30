# API Key Management

Users create and manage Gasket API keys through the Portal UI. Each key is scoped to a **backend profile** and carries optional feature opt-ins.

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

Admins can revoke any key from the [Admin Panel](admin.md). Admins can also **restore** revoked keys, but **expired keys cannot be restored**.

## VSCode Continue Integration

For any API key with the Continue opt-in enabled, Gasket generates a ready-to-use VSCode Continue extension config snippet. This snippet can be copied directly into the user's Continue configuration.

!!! tip
    The Continue config snippet is visible on the key detail page. It points at the Gasket gateway endpoint and includes the API key pre-filled.

## Open WebUI Integration

If a backend profile has Open WebUI header support enabled, users can additionally opt a key into this feature. See [Open WebUI Integration](open-webui.md) for how this affects metrics and quotas.
