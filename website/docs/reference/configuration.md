---
id: configuration
title: Configuration
sidebar_position: 3
description: Every environment variable AgriRomagna reads, with defaults and production guidance.
---

# Configuration

AgriRomagna reads configuration from environment variables. Use `.env` for local development and your platform's secret manager for production.

## Required

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Prisma datasource. Use an absolute path in production: `file:/var/lib/agriromagna/agri.db`. |
| `JWT_SECRET` | dev placeholder | **Must be changed in production.** Generate with `openssl rand -hex 32`. |

## Optional

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | One of `development`, `production`, `test`. |
| `PORT` | `3000` | HTTP port. |
| `HOSTNAME` | `0.0.0.0` | Bind address. Set to `127.0.0.1` behind a reverse proxy on the same host. |
| `LOG_LEVEL` | `info` | One of `debug`, `info`, `warn`, `error`. |
| `JWT_ACCESS_TTL_SECONDS` | `900` | Access-token lifetime (15 min). |
| `JWT_REFRESH_TTL_SECONDS` | `604800` | Refresh-token lifetime (7 days). |
| `BCRYPT_ROUNDS` | `10` | Password-hash cost factor. |
| `RATE_LIMIT_PER_MINUTE` | `1000` | Per-cooperative request budget. |
| `CORS_ORIGINS` | empty | Comma-separated list. Empty disables CORS (same-origin only). |
| `TELEMETRY_ENABLED` | `true` | Set to `false` to disable structured telemetry events. |
| `SATELLITE_NDVI_PROVIDER` | `copernicus` | NDVI source. `copernicus` is the only built-in. |
| `WEATHER_PROVIDER` | `arpae` | One of `arpae`, `openweather`, `mock`. |
| `WEATHER_API_KEY` | empty | Required when `WEATHER_PROVIDER=openweather`. |
| `OBJECT_STORAGE_URL` | empty | S3-compatible endpoint for photo uploads. If empty, photos are stored on local disk under `data/photos/`. |
| `OBJECT_STORAGE_BUCKET` | empty | Bucket name. |
| `OBJECT_STORAGE_ACCESS_KEY` | empty | |
| `OBJECT_STORAGE_SECRET_KEY` | empty | |
| `PUBLIC_BASE_URL` | `http://localhost:3000` | Used to construct QR-code URLs and email links. |

## Example `.env` for production

```bash
# Database
DATABASE_URL="file:/var/lib/agriromagna/agri.db"

# Security
JWT_SECRET="REPLACE_WITH_openssl_rand_hex_32"
BCRYPT_ROUNDS=12

# Runtime
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1
LOG_LEVEL=info

# Public surface
PUBLIC_BASE_URL="https://coop-vigne-romagna.example.it"

# Object storage (MinIO / S3)
OBJECT_STORAGE_URL="https://s3.example.it"
OBJECT_STORAGE_BUCKET="agriromagna-coop-vigne"
OBJECT_STORAGE_ACCESS_KEY="..."
OBJECT_STORAGE_SECRET_KEY="..."

# Telemetry
TELEMETRY_ENABLED=true
```

## Feature flags

A handful of capabilities are gated by flags to keep preview features off in stable deployments:

| Flag | Default | Effect when true |
|---|---|---|
| `FEATURE_DPP_EXPORT` | `false` | Enables the Digital Product Passport exporter. |
| `FEATURE_FEDERATION` | `false` | Enables cross-cooperative federation endpoints. |
| `FEATURE_AI_ADVISOR` | `true` | Enables the rule-based AI advisor. |
| `FEATURE_DATA_MARKETPLACE` | `false` | Enables paid data-sharing endpoints. |
