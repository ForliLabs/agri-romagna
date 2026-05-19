---
id: observability
title: Observability
sidebar_position: 3
description: Built-in telemetry, logs, health checks, and how to plug AgriRomagna into your monitoring stack.
---

# Observability

AgriRomagna emits structured logs and structured telemetry. Both are JSON, both are stable, both go to stdout by default — pick them up with any log collector.

## Logs

```json
{"ts":"2026-08-15T07:00:01.221Z","level":"info","msg":"api.request","method":"POST","path":"/api/fields","status":201,"durationMs":18,"userId":"usr_...","cooperativeId":"coop_..."}
{"ts":"2026-08-15T07:00:01.230Z","level":"warn","msg":"data.query.slow","model":"fields","op":"list","durationMs":312,"rows":1200}
```

Set `LOG_LEVEL` to `debug`, `info`, `warn` or `error`.

## Telemetry events

`src/lib/telemetry.ts` emits typed events for:

| Event | Trigger |
|---|---|
| `data.query` | Every data-layer call |
| `api.request` | Every HTTP request |
| `bus.event` | Every event-bus publish |
| `auth.login` | Successful login |
| `auth.failed` | Failed login attempt |
| `feature.used` | Dashboard feature hit (used for the feature heatmap) |

These power the in-app `/api/analytics` and `/api/analytics-engine/heatmap` endpoints. They're also fine to ship to Prometheus / Grafana / Datadog by tailing stdout.

## Health check

```bash
curl http://localhost:3000/api/health
```

```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptime": 42.1,
  "checks": {
    "database": "ok",
    "object_storage": "ok",
    "weather_provider": "ok"
  }
}
```

The health endpoint is **always public**, returns `200` when healthy and `503` when degraded. Use it as the liveness probe.

## Readiness vs liveness

- **Liveness**: `/api/health` — is the process alive?
- **Readiness**: `/api/health?strict=1` — also pings the database with a `SELECT 1` and the object storage with a `HEAD`. Use this for orchestrator gating.

## Correlation IDs

Every request gets a `X-Correlation-Id`. The id is propagated through logs, events and error responses, so a single user-visible failure can be traced end-to-end.

If your client sends `X-Correlation-Id`, the server honors it; otherwise one is generated.

## Audit log

Beyond logs, `superadmin` and `cooperative_admin` can query a curated audit log via `POST /api/rbac/audit-log` — only mutating administrative actions are recorded, with the actor, target, before/after diff and timestamp.

## Recommended stack

| Layer | Recommended tool | Notes |
|---|---|---|
| Logs | Loki + Promtail, or any syslog collector | JSON on stdout — trivially structured |
| Metrics | Prometheus via the `/api/health/metrics` endpoint (preview) | Or scrape your reverse proxy |
| Alerts | Grafana / Alertmanager | Alert on 5xx rate, `auth.failed` spike, `bus.event` error rate |
| Tracing | Opt-in via `TELEMETRY_OTLP_URL` (preview) | OpenTelemetry exporter |
