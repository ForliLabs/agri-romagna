---
id: iot-sensors
title: IoT & Sensors
sidebar_position: 4
description: Register sensor devices, stream readings, fuse with Sentinel-2 NDVI, and react to anomalies.
---

# IoT & Sensors

AgriRomagna treats IoT data as a **first-class agronomic signal**, not a side dashboard. Every reading lands in the same event bus as a journal entry, feeds the same anomaly detector, and contributes to the same yield prediction.

## Supported signal types

| Type | Unit | Used in |
|---|---|---|
| `soil_moisture` | % volumetric | Irrigation scheduler, drought alerts |
| `soil_temperature` | °C | Growing-degree-days (GDD), phenology |
| `air_temperature` | °C | Frost & heat alerts, GDD |
| `air_humidity` | % | Disease pressure models |
| `leaf_wetness` | minutes | Fungal disease risk |
| `solar_radiation` | W/m² | ET₀ (evapotranspiration) |
| `rainfall` | mm | Field water balance |
| `wind_speed` | m/s | Spray decision support |
| `ndvi` | index | Satellite-derived, weekly |

## Register a sensor device

```bash
curl -X POST http://localhost:3000/api/iot/devices \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vendor": "LoRaWAN Co.",
    "model": "SMT-100",
    "deviceEui": "70B3D57ED0050AB3",
    "fieldId": "fld_clz123",
    "depth_cm": 30,
    "capabilities": ["soil_moisture", "soil_temperature"]
  }'
```

The platform issues a `deviceId` and an ingest key. Use the key from your gateway (TheThingsNetwork, Chirpstack, etc.) to authenticate readings.

## Push a reading

```bash
curl -X POST http://localhost:3000/api/iot \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "deviceId": "dev_clz789",
    "readings": [
      {"type": "soil_moisture", "value": 28.4, "unit": "%", "at": "2026-08-15T07:00:00Z"},
      {"type": "soil_temperature", "value": 21.1, "unit": "°C", "at": "2026-08-15T07:00:00Z"}
    ]
  }'
```

Each reading fires a `sensor.reading` event. Three subscribers react:

1. **Anomaly detection** — flags readings outside expected bands.
2. **Irrigation scheduler** — recomputes the next irrigation window.
3. **AI advisor** — updates recommendations on the field.

## NDVI from Copernicus Sentinel-2

The platform pulls **NDVI** (Normalized Difference Vegetation Index) from the EU Copernicus program on a weekly cadence — free, high-resolution and unconstrained by IoT hardware.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/satellite/ndvi?fieldId=fld_clz123&from=2026-04-01&to=2026-09-30"
```

Returns a time series of NDVI per field, with optional pixel-level GeoJSON for the dashboard.

## Anomaly detection

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/anomaly-detection?fieldId=fld_clz123&since=24h"
```

Anomaly detection uses a per-device baseline (rolling 14-day percentiles) plus seasonal expectation. It's deliberately simple — interpretable, no opaque ML — and tested against historical Romagna farm data.

When an anomaly is detected, the dashboard surfaces it on the field page and a `weather.alert` or `anomaly.detected` event fires.

## Precision irrigation

The irrigation module fuses soil moisture, ET₀, NDVI and weather forecast into a per-field schedule:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/precision-irrigation?fieldId=fld_clz123"
```

```json
{
  "fieldId": "fld_clz123",
  "next_irrigation": "2026-08-17T05:00:00Z",
  "duration_min": 90,
  "expected_volume_m3": 14.2,
  "rationale": [
    "Soil moisture trending below 18% threshold",
    "Forecast: 30°C peaks, no rain 5 days",
    "ET₀ + crop coefficient (Kc=0.85): 4.1 mm/day"
  ]
}
```

## Offline ingest

Gateways behind unreliable links can buffer locally and POST a batch later. The endpoint accepts up to 1000 readings per request with idempotency keys, so retries don't double-count.

## See also

- [Concepts: Event bus](../concepts/event-bus.md)
- [Concepts: Offline-first](../concepts/offline-first.md)
- [API: IoT](../reference/api.md#iot--sensors)
