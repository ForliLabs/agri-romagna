---
id: first-field
title: Add Your First Field
sidebar_position: 4
description: Create your own cooperative, farm and field, then log the first operation.
---

# Add Your First Field

This is the "hello, world" of AgriRomagna. By the end you will have:

1. A real cooperative (not the seed).
2. A farm inside it.
3. A field inside that farm.
4. A first field-journal entry.

Total time: about 10 minutes.

## 1. Reset to a clean database

If you're starting fresh, wipe the demo data:

```bash
npm run db:reset
# Then skip the seed step when prompted, or seed and ignore the demo records.
```

## 2. Bootstrap a cooperative via the onboarding flow

AgriRomagna ships with a self-service onboarding wizard. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000/onboarding](http://localhost:3000/onboarding) and fill in:

- **Cooperative name** — e.g. `Cantina di Bertinoro`
- **Province** — e.g. `Forlì-Cesena`
- **Plan** — `Cooperativa`
- **Admin email & password** — these become your login

When the wizard completes you'll be redirected to the dashboard, signed in as the new admin.

## 3. Add a farm

From the dashboard sidebar: **Farms → New farm.**

```json title="Example payload (POST /api/fields/farms)"
{
  "name": "Podere Cà Lunga",
  "location": "Bertinoro",
  "province": "Forlì-Cesena",
  "hectares": 18,
  "specialty": "wine"
}
```

## 4. Add a field to the farm

From the farm detail page: **Fields → New field.**

```json title="POST /api/fields"
{
  "farmId": "farm_xxxxxxxx",
  "name": "Vigna del Sole",
  "hectares": 4.7,
  "crop": "Sangiovese",
  "variety": "Sangiovese di Romagna",
  "soilType": "argilloso-calcareo",
  "elevation": 220,
  "exposure": "south"
}
```

## 5. Log your first operation

Open the field, then click **Field Journal → Log entry.** Every action — pruning, treatment, irrigation, observation — becomes a structured event:

```json title="POST /api/fields/{id}/journal"
{
  "type": "treatment",
  "subtype": "biofungicide",
  "product": "Rame solfato 20%",
  "dose": "1.5 kg/ha",
  "operator": "Marco",
  "weather": { "temp": 18, "humidity": 72, "wind": 6 },
  "notes": "Trattamento preventivo dopo le piogge."
}
```

The same event automatically feeds:

- the **organic compliance log** (required for the next audit);
- the **traceability chain** for any lot harvested from this field;
- the **carbon ledger** (estimated emissions for the treatment).

That's the core loop. Everything else in AgriRomagna is variations on this pattern: structured events that feed cross-cutting modules through the [event bus](../concepts/event-bus.md).

## Next

- Wire up an IoT sensor → [IoT & Sensors guide](../guides/iot-sensors.md).
- Build a compliance audit package → [Compliance guide](../guides/compliance.md).
- Publish a product lot to the marketplace → [Marketplace guide](../guides/marketplace.md).
