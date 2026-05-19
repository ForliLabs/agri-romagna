---
id: carbon-and-esg
title: Carbon & ESG
sidebar_position: 6
description: Track per-field carbon emissions, water use and ESG indicators tied to your operations log.
---

# Carbon & ESG

Carbon accounting in AgriRomagna is **operations-driven**: every journal entry, irrigation event, fuel purchase and harvest contributes to the carbon ledger automatically. There is no parallel spreadsheet.

## What's measured

| Domain | Sources | Output |
|---|---|---|
| **Carbon (CO₂eq)** | Treatments, fuel, electricity, fertilizers, transport | kg CO₂eq per field / lot / season |
| **Water** | Irrigation events, rainfall, ET₀ | m³ per field, water-use efficiency |
| **Energy** | Equipment usage, processing facility meters | kWh per lot |
| **Soil health** | Tillage events, cover crops, OM measurements | Trend per field |
| **Biodiversity** | Buffer strips, IPM events, native plantings | Score per farm |

## Methodology

The carbon coefficients come from:

- **IPCC 2019 refinement** for agricultural emissions.
- **JRC LCA** for diesel and fertilizer emission factors.
- **ARERA** (Italian energy regulator) for grid carbon intensity per region.

Every calculation in `src/lib/carbon-data.ts` carries a citation that the platform shows when you drill into a number. **No black-box totals.**

## See per-field emissions

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/carbon?fieldId=fld_clz123&period=2026"
```

```json
{
  "fieldId": "fld_clz123",
  "period": "2026",
  "total_kg_co2eq": 1842,
  "by_source": {
    "diesel": 612,
    "fertilizer_production": 480,
    "field_emissions_n2o": 510,
    "treatments": 140,
    "electricity": 100
  },
  "intensity_kg_co2eq_per_ha": 392
}
```

## ESG indicators

ESG is computed at the **cooperative level** and surfaces a small, defensible set of indicators — not 200 vanity metrics:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/carbon?cooperativeId=$COOP_ID&format=esg"
```

| Indicator | Definition |
|---|---|
| **GHG intensity** | kg CO₂eq per €1000 revenue |
| **Water intensity** | m³ per ton of product |
| **Organic ratio** | Certified-organic hectares / total |
| **Biodiversity score** | 0–100 from buffer strips, IPM, cover crops |
| **Workforce stability** | Seasonal workers retained year-over-year |
| **Governance participation** | % of proposals with > 50% member turnout |

Each indicator is exportable in the EU CSRD format for cooperatives that need to report.

## Lot-level footprint for buyers

A buyer scanning a QR code on a product sees the **footprint of that specific lot**, allocated from the field-level emissions by harvest weight:

```bash
curl "http://localhost:3000/api/traceability/lot_clz456/footprint"
```

This is what powers the "0.42 kg CO₂eq per bottle" claim on the public traceability page. The number is computed at view time, never cached as a marketing asset.

## See also

- [Compliance](./compliance.md) — CSRD/EU reporting alignment.
- [API: Carbon & Sustainability](../reference/api.md#carbon--sustainability)
