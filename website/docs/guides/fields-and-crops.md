---
id: fields-and-crops
title: Fields & Crops
sidebar_position: 1
description: Manage fields, crop rotations, daily field journal and harvest declarations.
---

# Fields & Crops

The field is AgriRomagna's smallest unit of agronomic record-keeping. Every observation, treatment, irrigation event and yield is associated with a field. This guide walks through the full lifecycle.

## Create a field

```bash
curl -X POST http://localhost:3000/api/fields \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "farm_clz123",
    "name": "Vigna del Sole",
    "hectares": 4.7,
    "crop": "Sangiovese",
    "variety": "Sangiovese di Romagna",
    "soilType": "argilloso-calcareo",
    "elevation": 220,
    "exposure": "south",
    "rowSpacing": 2.4,
    "vineSpacing": 0.9,
    "geometry": { "type": "Polygon", "coordinates": [[[12.13, 44.15], /* ... */]] }
  }'
```

A `field.created` event fires on success (see [Event Bus](../concepts/event-bus.md)), opening downstream subscriptions in compliance, carbon and the AI advisor.

## Plan a crop rotation

The rotation planner produces a 3–7 year plan based on soil type, previous crops, and rest periods:

```bash
curl -X POST http://localhost:3000/api/fields/$FIELD_ID/rotation \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "yearsAhead": 5,
    "constraints": {
      "organic": true,
      "preferLegumes": true,
      "avoid": ["Solanum lycopersicum"]
    }
  }'
```

Returns a year-by-year plan with rationale for each crop choice, including biological notes (nitrogen-fixing breaks, disease pressure relief, market timing).

## Log a daily field journal entry

This is the workflow farms hit most often. Every type of operation is a structured event:

| Type | Used for |
|---|---|
| `treatment` | Pesticides, biocontrols, foliar feeds |
| `irrigation` | Water volume, source, duration |
| `tillage` | Plowing, harrowing, sub-soiling |
| `fertilization` | Organic and synthetic inputs |
| `observation` | Phenology stage, pest pressure, photos |
| `harvest` | Per-pass partial harvests |

```bash
curl -X POST http://localhost:3000/api/fields/$FIELD_ID/journal \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "treatment",
    "subtype": "biofungicide",
    "product": "Rame solfato 20%",
    "dose": "1.5 kg/ha",
    "operator": "Marco Tondini",
    "weather": { "temp": 18, "humidity": 72, "wind": 6 },
    "notes": "Trattamento preventivo dopo le piogge della settimana scorsa.",
    "photos": ["https://.../photo-1.jpg"]
  }'
```

The journal entry feeds:

- the [organic compliance log](./compliance.md) — required for the next audit;
- the [traceability chain](./traceability.md) — for lots harvested later from this field;
- the [carbon ledger](./carbon-and-esg.md) — emission estimate based on product and dose.

## Declare a harvest

Harvest declarations are the bridge between field data and the [supply chain](./traceability.md):

```bash
curl -X POST http://localhost:3000/api/fields/$FIELD_ID/harvests \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2026-09-22",
    "quantity": 31200,
    "unit": "kg",
    "quality": { "brix": 23.4, "ph": 3.35, "ta": 6.1 },
    "destination": "lot",
    "lotName": "Sangiovese 2026 — Vigna del Sole"
  }'
```

A harvest declaration:

1. Creates a `ProductLot` connected to this field.
2. Records actual yield against the latest `YieldPrediction` for accuracy tracking.
3. Closes any open in-season compliance subscriptions.

## See predicted yield

Yield prediction uses phenology, weather, soil data, and historical actuals (when available). Numbers are confidence-banded — never single-point estimates:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/yield-prediction?fieldId=$FIELD_ID
```

```json
{
  "fieldId": "fld_clz123",
  "as_of": "2026-08-15",
  "expected": { "p10": 26800, "p50": 31500, "p90": 36900, "unit": "kg" },
  "drivers": [
    {"factor": "spring_rain_mm", "impact": "+5%"},
    {"factor": "june_heatwave_days", "impact": "-3%"}
  ]
}
```

## What's next

- [Compliance & audits](./compliance.md) — turn journal entries into audit packages.
- [Traceability](./traceability.md) — follow harvested lots through the supply chain.
- [IoT & sensors](./iot-sensors.md) — feed real-time data into the field record.
