---
id: api-errors
title: API Errors (RFC 7807)
sidebar_position: 2
description: Every error code AgriRomagna can return, with the RFC 7807 schema and remediation steps.
---

# API Errors (RFC 7807)

AgriRomagna returns errors as [RFC 7807 problem documents](https://datatracker.ietf.org/doc/html/rfc7807). Error responses are JSON and use the `application/problem+json` media type.

## Schema

```json
{
  "type": "https://agriromagna.it/problems/<slug>",
  "title": "<Short human-readable title>",
  "status": 400,
  "detail": "<Long human-readable explanation>",
  "instance": "/api/fields",
  "errors": {
    "fieldName": ["Reason 1", "Reason 2"]
  }
}
```

`errors` is only present for `400` validation errors.

## Status codes

| Code | When | Notes |
|---|---|---|
| `200` | Success | Single resource or list |
| `201` | Created | Returns the created resource |
| `204` | No content | Successful DELETE |
| `400` | Validation error | `errors` field has per-attribute reasons |
| `401` | Authentication required | Missing/invalid/expired token |
| `403` | Insufficient permissions | RBAC or tenant boundary |
| `404` | Resource not found | |
| `409` | Conflict | Stale write, immutable record, idempotency mismatch |
| `422` | Semantically invalid | Business-rule failure (not schema) |
| `429` | Rate limited | Includes `Retry-After` header |
| `500` | Internal server error | Logged with a correlation id |
| `503` | Service unavailable | Maintenance / degraded backend |

## Common problem types

### `errore-di-validazione` — 400

```json
{
  "type": "https://agriromagna.it/problems/errore-di-validazione",
  "title": "Errore di validazione",
  "status": 400,
  "detail": "I dati forniti non sono validi.",
  "errors": {
    "email": ["Email non valida"],
    "password": ["Password troppo corta (min 6 caratteri)"]
  }
}
```

**Fix:** Inspect the `errors` map and correct the offending fields.

### `autenticazione-richiesta` — 401

```json
{
  "type": "https://agriromagna.it/problems/autenticazione-richiesta",
  "title": "Autenticazione richiesta",
  "status": 401,
  "detail": "Token mancante o scaduto."
}
```

**Fix:** Refresh the access token (`POST /api/auth` with `action: "refresh"`) or sign in again.

### `permessi-insufficienti` — 403

```json
{
  "type": "https://agriromagna.it/problems/permessi-insufficienti",
  "title": "Permessi insufficienti",
  "status": 403,
  "detail": "Il ruolo 'agronomist' non può eliminare campi."
}
```

**Fix:** See the [permission matrix](./roles-and-permissions.md).

### `risorsa-non-trovata` — 404

**Fix:** Verify the resource id and that it belongs to your cooperative.

### `conflitto-di-stato` — 409

```json
{
  "type": "https://agriromagna.it/problems/conflitto-di-stato",
  "title": "Conflitto di stato",
  "status": 409,
  "detail": "Il pacchetto di compliance è già stato firmato e non può essere modificato."
}
```

**Fix:** Re-fetch the resource; reconcile and retry against the current state.

### `rate-limit` — 429

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

**Fix:** Back off for the duration in `Retry-After`. The default budget is generous (1000 requests/min per cooperative); contact your admin if you hit it during normal use.

## Correlation IDs

Every error response includes an `X-Correlation-Id` header (and the same value as `correlationId` in 5xx bodies). Quote this id when filing an issue — server logs are indexed by it.
