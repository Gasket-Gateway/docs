# Helm Deployment

Gasket can be deployed to Kubernetes using the Helm charts provided in the `helm` repository.

Source: [`helm`](https://github.com/ajackson/gg) repository.

!!! note
Helm chart documentation is in progress. Refer to the `helm` repository README for the current state.

## Overview

The Helm charts deploy the Gasket gateway and portal into a Kubernetes cluster, with configurable values for:

- Gasket application image and replica count
- PostgreSQL connection settings
- OpenSearch connection settings
- Prometheus scrape configuration
- OIDC provider settings
- Ingress configuration (hostname, TLS)
- Backend profile configuration

## Quick Start

```bash
# Add the Gasket Helm repo (once available)
helm repo add gasket https://ajackson.github.io/gg-helm

# Install
helm install gasket gasket/gasket -f values.yaml
```
