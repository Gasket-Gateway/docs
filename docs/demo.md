# Gasket Gateway Demo

The following screenshots demonstrate the core user interfaces of the Gasket Gateway.

## User Portal

The user portal is where consumers of the API can view their allowed access, manage their API keys, and review the policies they have agreed to.

### Portal Dashboard
The dashboard provides a quick overview of connection health and usage metrics (once metrics are implemented).

![Portal Dashboard](assets/demo/portal_dashboard.png)

### Backend Profiles
Users can view the backend profiles they have been granted access to via their group memberships.

![Backend Profiles](assets/demo/portal_profiles.png)

### API Keys
Users can generate and revoke their own API keys, scoping them to specific backend profiles they have been granted access to.

![API Keys](assets/demo/portal_keys.png)

### Creating an API Key
A modal interface allows users to name their key, select a backend profile, and set an expiry date.

![Create API Key Modal](assets/demo/portal_keys_modal_add.png)

---

## Admin Panel

The admin panel is restricted to users in the `gasket-admins` group and provides full control over the gateway's configuration and access management.

### Status Overview
A high-level view of system component health.

![Admin Status](assets/demo/admin_status.png)

### OpenAI Backends
Define the upstream inference endpoints (e.g. internal vLLM clusters or external APIs like OpenAI).

![Admin Backends](assets/demo/admin_backends.png)

### Adding a Backend
Admins can easily add new inference endpoints via a comprehensive modal form.

![Add Backend Modal](assets/demo/admin_backends_modal_add.png)

### Policies
Create and version terms-of-use policies that users must accept before using specific backend profiles.

![Admin Policies](assets/demo/admin_policies.png)

### Backend Profiles
Group backends together, assign mandatory policies, and configure audit logging or quota limits for specific user roles.

![Admin Profiles](assets/demo/admin_profiles.png)

### Creating a Profile
The profile creation modal supports advanced settings like load balancing algorithms and quota enforcement.

![Create Profile Modal](assets/demo/admin_profiles_modal_add.png)

### API Key Management
View, revoke, or restore any API key across the entire system.

![Admin Keys](assets/demo/admin_keys.png)


