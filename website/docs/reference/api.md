---
id: api
title: REST API Reference
sidebar_position: 1
description: All ~50 AgriRomagna API endpoints, grouped by domain, with request/response examples.
---

# REST API Reference

AgriRomagna exposes ~50 REST endpoints through Next.js App Router route handlers, organized into 32 domain folders under `src/app/api`. All endpoints return JSON. Protected endpoints require a JWT Bearer token or an `access_token` cookie.

## Conventions

### Base URL

```
http://localhost:3000/api    # local
https://your-deployment/api  # production
```

### Authentication

All protected endpoints require one of:

- **`Authorization: Bearer <accessToken>`** header (preferred for programmatic clients), or
- **`access_token=<accessToken>`** cookie (used by the dashboard).

Tokens are obtained via `POST /api/auth` with `action: "login"`.

| Token | Expiry | Purpose |
|---|---|---|
| Access token | 15 min | API authentication |
| Refresh token | 7 days | Token renewal |

### Response shape

Successful responses use a consistent envelope:

```json
{
  "data": { /* the resource */ },
  "meta": { "count": 12, "page": 1, "pageSize": 50 }
}
```

Errors follow [RFC 7807](./api-errors.md):

```json
{
  "type": "https://agriromagna.it/problems/errore-di-validazione",
  "title": "Errore di validazione",
  "status": 400,
  "detail": "I dati forniti non sono validi.",
  "errors": { "email": ["Email non valida"] }
}
```

### Pagination

Endpoints returning lists accept `page` and `pageSize` (max 200, default 50):

```bash
GET /api/fields?page=2&pageSize=25
```

### Filtering and sorting

```bash
GET /api/fields?farmId=farm_clz123&crop=Sangiovese&sort=-createdAt
```

`sort` accepts a comma-separated list; prefix with `-` for descending.

### Idempotency

Mutating endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) accept an `Idempotency-Key` header. Replaying a request with the same key within 24 hours returns the cached response.

---

## Endpoints by domain

The full surface is listed below. Each link points to a worked example in the relevant guide.

### Auth

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/auth` | Current user from token |
| `POST` | `/api/auth` | `action: "login" \| "register" \| "refresh" \| "logout"` |

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"elena.bellini@vignediromagna.it","password":"demo"}'
```

### Health

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/health` | Liveness + readiness probe, always public |

### Fields

| Method | Path |
|---|---|
| `GET` `POST` | `/api/fields` |
| `GET` `PATCH` `DELETE` | `/api/fields/{id}` |
| `GET` `POST` | `/api/fields/{id}/journal` |
| `GET` `POST` | `/api/fields/{id}/harvests` |
| `POST` | `/api/fields/{id}/rotation` |

See the [Fields & Crops guide](../guides/fields-and-crops.md).

### Compliance

| Method | Path |
|---|---|
| `GET` | `/api/compliance` |
| `GET` `POST` | `/api/compliance/packages` |
| `GET` | `/api/compliance/packages/{id}/download` |
| `GET` | `/api/compliance/dpp` |

### Compliance Chain

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/compliance-chain` | Append-only, hash-linked event log |
| `GET` | `/api/compliance-chain/{eventId}` | Single event with predecessors |

### Traceability

| Method | Path |
|---|---|
| `GET` | `/api/traceability/{lotId}` |
| `GET` | `/api/traceability/qr?lotId=...` |

The public consumer view lives outside `/api` at `/traceability/{lotId}`.

### IoT & Sensors

| Method | Path |
|---|---|
| `GET` `POST` | `/api/iot` |
| `GET` `POST` | `/api/iot/devices` |
| `GET` `PATCH` `DELETE` | `/api/iot/devices/{id}` |

### Weather

| Method | Path |
|---|---|
| `GET` | `/api/weather?fieldId=...` |
| `GET` | `/api/weather/alerts` |

### Supply Chain

| Method | Path |
|---|---|
| `GET` `POST` | `/api/supply-chain/lots` |
| `GET` `POST` | `/api/supply-chain/events` |

### Marketplace

| Method | Path |
|---|---|
| `GET` `POST` | `/api/marketplace/products` |
| `GET` `PATCH` | `/api/marketplace/products/{id}` |
| `GET` `POST` | `/api/marketplace/orders` |
| `GET` `PATCH` | `/api/marketplace/orders/{id}` |

### Financial

| Method | Path |
|---|---|
| `GET` `POST` | `/api/financial/costs` |
| `GET` `POST` | `/api/financial/revenues` |
| `GET` | `/api/financial/kpis` |

### Carbon & Sustainability

| Method | Path |
|---|---|
| `GET` `POST` | `/api/carbon` |
| `GET` | `/api/carbon?format=esg` |

### Water Management

| Method | Path |
|---|---|
| `GET` `POST` | `/api/water` |
| `GET` | `/api/water/balance?fieldId=...` |

### Yield Prediction

| Method | Path |
|---|---|
| `GET` | `/api/yield-prediction?fieldId=...` |
| `POST` | `/api/yield-prediction/refresh` |

### Pest Warning

| Method | Path |
|---|---|
| `GET` | `/api/pest-warning?fieldId=...` |

### Disease Prediction

| Method | Path |
|---|---|
| `GET` | `/api/disease-prediction?fieldId=...` |

### Precision Irrigation

| Method | Path |
|---|---|
| `GET` | `/api/precision-irrigation?fieldId=...` |
| `POST` | `/api/precision-irrigation/apply` |

### Governance

| Method | Path |
|---|---|
| `GET` `POST` | `/api/governance/proposals` |
| `GET` `PATCH` | `/api/governance/proposals/{id}` |
| `POST` | `/api/governance/votes` |

### Benchmarking

| Method | Path |
|---|---|
| `GET` | `/api/benchmarking` |

### AI Advisor

| Method | Path |
|---|---|
| `GET` | `/api/advisor?fieldId=...` |
| `POST` | `/api/advisor/ask` |

### Intelligence & Events

| Method | Path |
|---|---|
| `GET` | `/api/intelligence/events` |
| `GET` | `/api/intelligence/timeline` |

### Anomaly Detection

| Method | Path |
|---|---|
| `GET` | `/api/anomaly-detection?fieldId=...` |

### Knowledge Graph

| Method | Path |
|---|---|
| `GET` | `/api/knowledge-graph?nodeId=...` |

### Federation

| Method | Path |
|---|---|
| `GET` `POST` | `/api/federation/peers` |
| `POST` | `/api/federation/share` |

### Interoperability

| Method | Path |
|---|---|
| `POST` | `/api/interoperability/isobus` |
| `POST` | `/api/interoperability/inspire` |
| `POST` | `/api/integrations/{vendor}/webhook` |

### Routes & Logistics

| Method | Path |
|---|---|
| `POST` | `/api/routes/optimize` |
| `GET` | `/api/routes/{id}` |

### Mobile / Sync

| Method | Path |
|---|---|
| `POST` | `/api/sync` |
| `GET` | `/api/mobile/manifest` |

See the [offline-first concept](../concepts/offline-first.md).

### Notifications

| Method | Path |
|---|---|
| `GET` | `/api/notifications` |
| `PATCH` | `/api/notifications/{id}` |

### Data Marketplace

| Method | Path |
|---|---|
| `GET` | `/api/data-marketplace` |
| `POST` | `/api/data-marketplace/purchase` |

### RBAC

| Method | Path |
|---|---|
| `GET` | `/api/rbac/roles` |
| `GET` | `/api/rbac/permissions` |
| `POST` | `/api/rbac/audit-log` |

### Onboarding

| Method | Path |
|---|---|
| `POST` | `/api/onboarding/cooperative` |
| `POST` | `/api/onboarding/farm` |

### Analytics

| Method | Path |
|---|---|
| `GET` | `/api/analytics` |
| `GET` | `/api/analytics-engine/heatmap` |

### Test Harness

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/test-harness/reset` | **Dev only** — wipes the database |
| `POST` | `/api/test-harness/scenario` | Apply a named demo scenario |

### Moonshots

| Method | Path |
|---|---|
| `GET` | `/api/moonshots` |

### Insights

| Method | Path |
|---|---|
| `GET` | `/api/insights` |

### Collaboration

| Method | Path |
|---|---|
| `GET` `POST` | `/api/collaboration/channels` |
| `POST` | `/api/collaboration/messages` |

### Export

| Method | Path |
|---|---|
| `GET` | `/api/export?type=...&format=csv\|jsonld\|pdf` |

### Actions

| Method | Path |
|---|---|
| `POST` | `/api/actions/{name}` | Pre-defined server actions (e.g. `confirm-harvest`, `lock-period`) |

---

## OpenAPI

The full OpenAPI 3.1 specification can be exported:

```bash
curl http://localhost:3000/api/health/openapi.json -o openapi.json
```

The spec is generated from the Zod schemas in `src/lib/validators/`, so it stays in sync with the code.
