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

The [Admin Panel](admin.md) provides a search and filter interface over OpenSearch audit records, with support for:

- Keyword search across metadata fields
- Filtering by user, API key, backend, model, or time range
- Metadata-only view or full content view
- Request/response histograms showing usage over time
- Aggregated conversation thread view
