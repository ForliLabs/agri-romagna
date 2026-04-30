# API Reference

AgriRomagna exposes ~50 REST endpoints through Next.js App Router API routes. All endpoints return JSON. Protected endpoints require a JWT Bearer token or `access_token` cookie.

---

## Table of Contents

- [Authentication](#authentication)
- [Common Response Formats](#common-response-formats)
- [Endpoints by Domain](#endpoints-by-domain)
  - [Auth](#auth)
  - [Health](#health)
  - [Fields](#fields)
  - [Compliance](#compliance)
  - [Traceability](#traceability)
  - [IoT & Sensors](#iot--sensors)
  - [Weather](#weather)
  - [Supply Chain](#supply-chain)
  - [Marketplace](#marketplace)
  - [Financial](#financial)
  - [Carbon & Sustainability](#carbon--sustainability)
  - [Water Management](#water-management)
  - [Yield Prediction](#yield-prediction)
  - [Pest Warning](#pest-warning)
  - [Governance](#governance)
  - [Benchmarking](#benchmarking)
  - [AI Advisor](#ai-advisor)
  - [Intelligence & Events](#intelligence--events)
  - [Anomaly Detection](#anomaly-detection)
  - [Knowledge Graph](#knowledge-graph)
  - [Compliance Chain](#compliance-chain)
  - [Federation](#federation)
  - [Interoperability](#interoperability)
  - [Routes & Logistics](#routes--logistics)
  - [Mobile](#mobile)
  - [Data Marketplace](#data-marketplace)
  - [RBAC](#rbac)
  - [Onboarding](#onboarding)
  - [Analytics](#analytics)
  - [Test Harness](#test-harness)
  - [Moonshots](#moonshots)
  - [Insights](#insights)

---

## Authentication

All protected endpoints require one of:
- **Authorization header:** `Authorization: Bearer <access_token>`
- **Cookie:** `access_token=<token>`

Tokens are obtained via `POST /api/auth` (login action).

### Token Format

```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1...",
  "expiresIn": 900
}
```

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 15 min | API authentication |
| Refresh Token | 7 days | Token renewal |

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "meta": { "count": 10 }
}
```

### Error Response (RFC 7807)

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

### Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / Bad request |
| 401 | Authentication required |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Endpoints by Domain

### Auth

**Public — no token required.**

#### `GET /api/auth`

Returns the currently authenticated user from the request token.

**Response:**
```json
{
  "user": {
    "id": "cuid...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "cooperative_admin",
    "cooperativeId": "cuid...",
    "farmId": null
  }
}
```

#### `POST /api/auth`

Multiplexed auth endpoint. Behavior depends on the `action` field:

**Login** (`action: "login"` or omitted):
```json
// Request
{ "email": "admin@example.com", "password": "password123" }

// Response (200)
{
  "success": true,
  "user": { ... },
  "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
}
```

**Register** (`action: "register"`):
```json
// Request
{
  "action": "register",
  "email": "new@example.com",
  "password": "securepass",
  "name": "New User",
  "role": "viewer",
  "cooperativeId": "optional",
  "phone": "optional"
}

// Response (201)
{ "success": true, "user": { ... } }
```

**Refresh** (`action: "refresh"`):
```json
// Request
{ "action": "refresh", "refreshToken": "eyJhbGci..." }

// Response (200)
{ "success": true, "tokens": { ... } }
```

---

### Health

**Public — no token required.**

#### `GET /api/health`

System health check. Used by Docker healthcheck.

**Response:**
```json
{ "status": "ok", "database": "connected", "timestamp": "2025-..." }
```

---

### Fields

**Permissions:** `fields:read` (GET), `fields:write` (POST)

#### `GET /api/fields`

List all fields for the authenticated user's farm, with farm metadata.

#### `POST /api/fields`

Create a new field record.

**Request body** (validated by `createFieldSchema`):
```json
{
  "name": "Campo Nord",
  "crop": "Grano tenero",
  "areaHa": 12.5,
  "status": "active",
  "plantingDate": "2025-03-15",
  "municipality": "Cesena",
  "expectedHarvest": "2025-07-20",
  "expectedVolume": 8500,
  "health": "good",
  "irrigation": "drip",
  "notes": "Terreno argilloso"
}
```

---

### Compliance

**Permission:** `compliance:read`

#### `GET /api/compliance`

Returns compliance records, events, and summary statistics for the user's fields.

---

### Traceability

**Permission:** `traceability:read`

#### `GET /api/traceability`

Returns product digital passport data. Supports optional `?lotId=` query parameter for a specific lot, or returns all lots.

---

### IoT & Sensors

**Permission:** `iot:read`

#### `GET /api/iot`

Returns IoT devices, sensor readings, alerts, and latest values for the user's fields.

---

### Weather

**Permission:** `weather:read`

#### `GET /api/weather`

Returns static farm weather data.

#### `GET /api/weather/live`

Returns live weather, 7-day forecast, river levels, alerts, and weather notifications.

---

### Supply Chain

**Permissions:** `supply-chain:read` (GET), `supply-chain:write` (POST)

#### `GET /api/supply-chain`

Returns supply-chain lots, timelines, and summary.

#### `POST /api/supply-chain`

Process harvest declarations or transition supply-chain lot status.

---

### Marketplace

**Permission:** `marketplace:read`

#### `GET /api/marketplace`

Returns marketplace products, orders, and revenue summary.

---

### Financial

**Permissions:** `financial:read` (GET), `financial:write` (POST)

#### `GET /api/financial`

Returns cooperative/field financial KPIs and projections.

#### `POST /api/financial`

Add cost or revenue entries. Request validated by `createCostEntrySchema` or `createRevenueEntrySchema` (distinguished by `type` field).

```json
// Cost entry
{
  "type": "cost",
  "fieldId": "...",
  "date": "2025-06-01",
  "category": "fertilizer",
  "description": "Urea 46%",
  "amount": 450.00
}

// Revenue entry
{
  "type": "revenue",
  "fieldId": "...",
  "date": "2025-07-15",
  "source": "harvest_sale",
  "description": "Vendita grano",
  "amount": 12000.00
}
```

---

### Carbon & Sustainability

**Permissions:** `carbon:read` (GET), `carbon:write` (POST)

#### `GET /api/carbon`

Returns carbon summary, categories, and compliance readiness.

#### `POST /api/carbon`

Add a carbon entry (validated by `createCarbonEntrySchema`).

```json
{
  "fieldId": "...",
  "date": "2025-06-01",
  "category": "emission",
  "source": "diesel_tractor",
  "quantity": 150.0,
  "co2eKg": 450.0
}
```

---

### Water Management

**Permissions:** `water:read` (GET), `water:write` (POST)

#### `GET /api/water`

Returns water quotas, irrigation needs, and water-efficiency data.

#### `POST /api/water`

Store/update irrigation schedule data (validated by `createIrrigationScheduleSchema`).

---

### Yield Prediction

**Permission:** `yield:read`

#### `GET /api/yield-prediction`

Returns yield prediction summary, models, and per-field predictions.

#### `POST /api/yield-prediction`

Compute yield prediction for a specific field.

---

### Pest Warning

**Permission:** `pest-warning:read`

#### `GET /api/pest-warning`

Returns pest/disease warning models and active warnings.

#### `POST /api/pest-warning`

Calculate pest risk or treatment recommendations.

---

### Governance

**Permissions:** `governance:read` (GET), `governance:write` (POST)

#### `GET /api/governance`

Returns proposals, AGM calendar, bylaws, and governance data.

#### `POST /api/governance`

Create proposal or submit vote (validated by `createProposalSchema`).

---

### Benchmarking

**Permission:** `benchmarking:read`

#### `GET /api/benchmarking`

Returns farm/cooperative benchmark data and trends.

#### `POST /api/benchmarking`

Submit benchmarking query and return computed results.

---

### AI Advisor

**Permission:** `advisor:read`

#### `GET /api/advisor`

List saved AI advisories.

#### `POST /api/advisor`

Submit a message for AI advisory/chat response for a field context.

```json
{
  "message": "When should I start irrigating the wheat fields?",
  "fieldId": "optional-field-id"
}
```

---

### Intelligence & Events

**Permission:** `intelligence:read`

#### `GET /api/intelligence`

Returns intelligence-fabric overview and event-bus status (active flows, recent events, statistics).

#### `POST /api/intelligence`

Publish intelligence updates (weather, NDVI, sensor events) to the event bus.

---

### Anomaly Detection

**Permission:** `anomaly:read`

#### `GET /api/anomaly-detection`

Returns anomaly streams, detected anomalies, correlations, models, and digests.

---

### Knowledge Graph

**Permission:** `knowledge-graph:read`

#### `GET /api/knowledge-graph`

Returns knowledge graph entities, relations, dossiers, and seasonal digests.

---

### Compliance Chain

**Permission:** `compliance-chain:read`

#### `GET /api/compliance-chain`

Returns compliance chain, mappings, audit packages, and scores.

---

### Federation

**Permission:** `federation:read`

#### `GET /api/federation`

Returns federation overview, members, governance, and carbon/supply summaries across cooperatives.

---

### Interoperability

**Permissions:** `interoperability:read` (GET), `interoperability:write` (POST)

#### `GET /api/interoperability`

Returns interoperability dashboard and export jobs.

#### `POST /api/interoperability`

Create a data export job (validated by `createExportJobSchema`).

**Supported formats:** `isobus_iso11783`, `geojson_inspire`, `efdi_json`, `agea_xml`, `sian_csv`, `arpae_json`

```json
{
  "format": "geojson_inspire",
  "scope": "farm"
}
```

---

### Routes & Logistics

**Permission:** `logistics:read`

#### `GET /api/routes`

Returns optimized harvest collection routes for vehicles and declarations.

---

### Mobile

**Permission:** `mobile:read`

#### `GET /api/mobile`

Returns mobile features, offline queue status, and sync status.

---

### Data Marketplace

**Permission:** `data-marketplace:read`

#### `GET /api/data-marketplace`

Returns API endpoints, consumers, data products, and metrics for the data marketplace.

---

### RBAC

**Permission:** `rbac:read`

#### `GET /api/rbac`

Returns roles, permissions, sessions, audit log, and data isolation rules.

---

### Onboarding

**Public for POST (initial cooperative setup).**

#### `POST /api/onboarding`

Run cooperative onboarding or generate sample data.

```json
{
  "cooperativeName": "Cooperativa Romagna",
  "region": "Emilia-Romagna",
  "province": "Forlì-Cesena",
  "adminEmail": "admin@coop.it",
  "adminPassword": "securepass",
  "adminName": "Mario Rossi"
}
```

---

### Analytics

**Permission:** `analytics:read` (GET)

#### `GET /api/analytics`

Returns analytics dashboard telemetry (route stats, feature heatmap, response times).

#### `POST /api/analytics`

Record client analytics events and page views.

---

### Test Harness

**Permission:** `test-harness:read`

#### `GET /api/test-harness`

Returns test suites, CI build status, coverage, and test summary.

---

### Moonshots

**Permission:** none (varies)

#### `GET /api/moonshots`

Returns the moonshot portfolio (experimental features).

#### `GET /api/moonshots/[feature]`

Returns a specific moonshot feature by feature ID.

---

### Insights

**Permission:** `insights:read`

#### `GET /api/insights`

Returns insight templates, results, alerts, and queries.

---

## Validation Schemas

All POST endpoints with structured input use Zod validation. Invalid requests return RFC 7807 `application/problem+json` responses.

| Schema | Used By | Key Fields |
|--------|---------|------------|
| `loginSchema` | `POST /api/auth` | email, password |
| `registerSchema` | `POST /api/auth` | email, password (min 8), name, role |
| `refreshTokenSchema` | `POST /api/auth` | refreshToken |
| `createFieldSchema` | `POST /api/fields` | name, crop, areaHa, status, plantingDate |
| `createCarbonEntrySchema` | `POST /api/carbon` | fieldId, date, category, source, quantity |
| `createCostEntrySchema` | `POST /api/financial` | type:"cost", fieldId, category, amount |
| `createRevenueEntrySchema` | `POST /api/financial` | type:"revenue", fieldId, source, amount |
| `createProposalSchema` | `POST /api/governance` | title, description, proposedBy |
| `createIrrigationScheduleSchema` | `POST /api/water` | fieldId, method |
| `createBenchmarkSchema` | `POST /api/benchmarking` | farmId |
| `createExportJobSchema` | `POST /api/interoperability` | format, scope |
