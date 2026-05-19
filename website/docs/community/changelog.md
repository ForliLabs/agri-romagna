---
id: changelog
title: Changelog
sidebar_position: 3
description: Notable changes to AgriRomagna by version. We follow Semantic Versioning starting at 1.0.
---

# Changelog

AgriRomagna will follow [Semantic Versioning](https://semver.org) starting at `1.0.0`. Until then, we're at `0.x` and reserve the right to make breaking changes between minor versions — we will always list them here.

For the canonical, machine-readable changelog see [`CHANGELOG.md`](https://github.com/ForliLabs/agri-romagna/blob/main/CHANGELOG.md) in the repository.

## [0.1.0] — Initial public release

The first publicly-released version. Foundation features across ten functional domains.

### Added

- **Core platform**: Next.js 16 App Router, TypeScript 5, Prisma 7 with `better-sqlite3`, React 19, Tailwind 4.
- **Auth**: JWT (access + refresh) with bcrypt password hashing. Edge middleware path gate.
- **RBAC**: 6 roles + `superadmin`, 70+ permissions, RFC 7807 errors.
- **Data layer**: 36 Prisma models, 36 typed accessors, `InMemoryStore` shim, tenant scoping.
- **Event bus**: in-process pub/sub with circuit breaker, 15 documented flows.
- **Field & crop management**: fields, journal entries, harvest declarations, yield prediction (P10/P50/P90), rotation planner.
- **Compliance**: organic / DOP / IGP / CAP audit-package builder, append-only hash-linked compliance chain.
- **Traceability**: product lots, supply-chain events, public QR pages.
- **IoT & sensing**: sensor device registry, readings ingest, anomaly detection, Sentinel-2 NDVI integration.
- **Financial**: cost & revenue entries, KPIs, insurance policies.
- **Carbon & ESG**: per-field carbon ledger, per-lot footprint, ESG indicators.
- **Marketplace**: product listings, B2B orders, benchmarking with privacy guarantees (n ≥ 5).
- **Governance**: proposals with weighted voting, quorum and supermajority rules, signed minutes.
- **Communication hub**: channels and messages per cooperative.
- **Mobile / Sync**: PWA, service worker, IndexedDB local store, `/api/sync` reconcile endpoint.
- **Operations**: Docker multi-stage image (~140 MB), `docker-compose.yml`, health probe.
- **Testing**: 67 unit tests across 8 Vitest suites; Playwright e2e harness.
- **Docs**: Architecture, API reference, RBAC matrix, configuration reference and 7 guides on this site.

### Known limitations

- Italian-first UI; English locale is partial.
- Livestock is not yet modeled.
- DPP exporter is a preview; final EU schema is still in consultation.
- LLM-backed advisor enhancements are feature-flagged off.

## Upcoming

The next minor release will focus on:

- English UI locale.
- Federation (cross-cooperative benchmarking) graduating from `FEATURE_FEDERATION` to stable.
- React Native mobile companion app.
- Postgres adapter for cooperatives that need shared-database deployments.

Track the roadmap in [GitHub Projects](https://github.com/ForliLabs/agri-romagna/projects).
