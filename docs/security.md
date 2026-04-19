# Security Architecture & Posture

This document defines the security posture of the Gasket Gateway, evaluating the codebase against industry-standard frameworks: OWASP ASVS, SLSA, CNCF 4C's, ASD Essential Eight, and NIST SSDF. 

It is maintained for engineering peers to understand current technical controls, identify architectural gaps, and track our remediation roadmap.

---

## System-Wide Posture Summary

Gasket Gateway acts as a localized proxy bridging client applications and upstream AI infrastructure. From an architecture perspective, **our delegation of identity to an external, local-first OIDC provider is a massive design win**. By completely offloading credential handling, MFA enforcement, and identity lifecycle to dedicated IdPs (like Authentik or Keycloak), we drastically reduce the internal attack surface. 

However, as a Cloud-Native Python application, we face maturity gaps in container hardening (running as root), CI/CD verification (missing SBOM/Provenance), and edge API security (lack of rate limiting and header sanitization).

---

## 1. OWASP ASVS (v4.0.3)

We evaluate against ASVS Level 2, focusing on Authentication (V2), Session Management (V3), and API Security (V13).

### Current Adherence
- **V2 (Authentication):** Fully delegated via `authlib`. Zero local credential storage. (Implemented in `gasket/app/auth.py`).
- **V3 (Session Management):** Flask cookie-based sessions with a hard-coded expiration logic (8-hour default) evaluated on every request in the `login_required` decorator (`gasket/app/auth.py:85-93`).
- **V13 (API Security):** Hop-by-hop headers are rigorously stripped in the proxy middleware (`gasket/app/proxy_engine.py:27`). Database interactions rely strictly on SQLAlchemy ORM parameterized queries (`gasket/app/models.py`), neutralizing SQLi.

### Security Gaps
- **V2.1.1 (Auth Bypass):** The `GASKET_TEST_MODE` environment variable globally bypasses OIDC and injects an administrative session (`gasket/app/__init__.py:86`). If this leaks into production, it is a critical vulnerability.
- **V3.1.1 (Session Entropy/Availability):** If `secret_key` is omitted in `config.yaml`, Flask falls back to `secrets.token_hex(32)` on startup (`gasket/app/auth.py:27`). In an HA environment, this silently breaks session persistence across replicas.
- **V13.1.1 (Header Spoofing):** Client IP headers (`X-Forwarded-For`, `X-Real-IP`) are forwarded upstream without cryptographic validation or explicit sanitization.
- **V13.1.4 (Rate Limiting):** The proxy endpoint (`/v1/*`) lacks concurrency controls or token-bucket rate limiting, exposing upstream LLMs to volumetric DoS and rapid cost-exhaustion.

### Roadmap (Technical Fixes)
- [ ] **CLI Fix:** Implement `Flask-Limiter` on the `/v1/*` blueprint with default Redis-backed quotas.
- [ ] **Code Fix:** Assert `FLASK_ENV == "development"` before allowing `GASKET_TEST_MODE` to engage.
- [ ] **Code Fix:** Implement middleware to sanitize `X-Forwarded-For` against a trusted proxy CIDR list.

---

## 2. CNCF 4C's (Cloud, Cluster, Container, Code)

### Current Adherence
- **Code:** We use `python:3.13-slim` for a minimal base footprint. The web server uses `gunicorn` with multiple workers (`gasket/Dockerfile:29`).
- **Cluster:** Helm chart allows overriding `securityContext` and `podSecurityContext` (`helm/charts/gasket/templates/deployment.yaml:38`). 

### Security Gaps
- **Container:** The `Dockerfile` does not declare a non-root `USER`. By default, the application runs as `root` inside the container namespace.
- **Cluster:** The Helm chart lacks a `NetworkPolicy` to restrict egress (e.g., locking down outbound traffic to *only* the OIDC provider and allowed OpenAI endpoints). `readOnlyRootFilesystem` is not enforced.

### Roadmap (Technical Fixes)
- [ ] **Dockerfile Fix:** Add `RUN useradd -m gasket` and switch `USER gasket`.
- [ ] **Helm Fix:** Add default `securityContext` in `values.yaml` setting `runAsNonRoot: true` and `allowPrivilegeEscalation: false`.

---

## 3. SLSA & NIST SSDF (Supply Chain & CI/CD)

### Current Adherence
- **SSDF (Build Integrity):** Container images are built via GitHub Actions (`build-container.yml`) and pushed to GHCR using official Docker Buildx actions.

### Security Gaps
- **SLSA Provenance:** We are not generating SLSA provenance or SBOMs (Software Bill of Materials) during the GitHub Actions build step. 
- **SSDF (Automated Security Testing):** The CI pipeline lacks SAST (Static Application Security Testing) and SCA (Software Composition Analysis) gates. 

### Roadmap (Technical Fixes)
- [ ] **CI Automation:** Update `build-container.yml` to include `provenance: true` and `sbom: true` on the `docker/build-push-action`.
- [ ] **CI Automation:** Add a pre-build job running `bandit` (SAST) and `pip-audit` (SCA) to fail the build on high-severity CVEs.

---

## 4. ASD Essential Eight

### Current Adherence
- **MFA Enforcement:** Since Gasket never touches passwords, MFA enforcement is cleanly delegated to the OIDC provider (e.g., requiring WebAuthn/TOTP in Authentik before issuing the token).
- **Restrict Administrative Privileges:** Administrative access is dynamically mapped via the `gasket-admins` OIDC group claim (`gasket/app/__init__.py:136`). Privileges can be instantly revoked at the IdP level without interacting with the Gasket database.

### Security Gaps
- **Application Control:** We rely on the implicit boundary of the Python environment.
- **Patching Applications:** Upstream LLM providers (OpenAI) manage backend patching, but we lack automated dependency bumping (e.g., Dependabot) for our own Flask/Authlib stack.

### Roadmap (Technical Fixes)
- [ ] **Automation:** Integrate Dependabot or Renovate into the repository to maintain strict patch SLAs for Python dependencies.
