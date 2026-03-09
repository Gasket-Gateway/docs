# Helm Deployment

Gasket can be deployed to Kubernetes using the Helm charts provided in the `helm` repository.

Source: [`helm`](https://github.com/Gasket-Gateway/helm) repository.

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
helm repo add gasket-gateway https://Gasket-Gateway.github.io/helm

# Install
helm install gasket gasket-gateway/gasket -f values.yaml
```
