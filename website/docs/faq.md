---
id: faq
title: FAQ
sidebar_position: 91
description: Frequently asked questions about AgriRomagna — licensing, scope, scale, alternatives.
---

# FAQ

## What is AgriRomagna?

A vertical SaaS platform for agricultural cooperatives and small farms, built first for Emilia-Romagna and applicable across EU cooperative agriculture. It unifies field management, EU compliance, traceability, IoT, marketplace and governance in one Next.js application.

## Who is it for?

- Agricultural cooperatives with 5–500 member farms.
- Independent farms that want a digital field journal and risk monitoring.
- Cooperative IT teams and developers who need a hackable open-source base.

## Is it really used in production?

AgriRomagna is at `0.1.x`. The codebase is **production-shaped** — 36 Prisma models, ~50 endpoints, RBAC, RFC 7807 errors, 67 unit tests — and is being piloted with cooperatives in Forlì-Cesena. We mark it pre-1.0 to be honest about breaking-change risk.

## How does this differ from xFarm / Agrivi / FarmLogs?

- **Cooperative-native.** Most farm SaaS is built for individual large farms. AgriRomagna is built around the Italian cooperative model: many small farms, shared logistics, joint compliance.
- **EU-first compliance.** Organic, DOP/IGP, CAP and the upcoming Digital Product Passport are first-class.
- **Open-source and self-hostable.** EU data residency is a one-line config, not a procurement negotiation.
- **Offline-first.** Designed for fields with patchy connectivity.

See the [comparison page](./comparison.md) for a side-by-side.

## What language is the dashboard in?

The UI uses Italian as the primary language. Validation error messages are Italian by convention. Internationalization is supported (Docusaurus uses `i18n` in its config; the app exposes the same surface) — English and additional locales are on the roadmap.

## Why SQLite? Won't I outgrow it?

SQLite with `better-sqlite3` handles **thousands of writes per second** on commodity hardware. Per cooperative that's a multiple of expected load. When you outgrow it — or need cross-region replication — the data layer is the seam: `src/lib/data-layer.ts` has a single point of swap. We document the upgrade path in the [architecture concept](./concepts/architecture.md).

## Can I run multiple cooperatives on one deployment?

Yes — the platform is multi-tenant by row (`cooperativeId`). It's also fine to run **one deployment per cooperative** when regulatory isolation matters. See [Multi-tenancy](./concepts/multi-tenancy.md).

## What about mobile?

The dashboard is a PWA — install it from any modern browser and it works offline. A dedicated React Native app is on the roadmap for richer camera and GPS workflows.

## Does AgriRomagna call AI providers?

The built-in advisor is **rule-based** — interpretable and runs entirely locally. No data leaves your deployment by default. Optional LLM-backed enhancements are gated behind feature flags and require explicit configuration.

## Can I integrate with my existing ERP / FMIS?

Yes. The platform speaks **ISOBUS** for in-tractor exchange and **INSPIRE** for geographic interoperability, and exposes generic webhook endpoints at `/api/integrations/{vendor}/webhook`. See [API: Interoperability](./reference/api.md#interoperability).

## What about EU funding (PNRR / CAP)?

The compliance module produces the audit packages required for CAP subsidies and tracks PNRR-aligned indicators. We do not file applications on your behalf, but the data needed to file is exportable in the right shapes.

## Is it really free?

The code is open-source and self-hostable. A future managed-hosting offering may be commercial. For self-hosting, your only costs are infrastructure (€5–30/month for a small cooperative).

## How can I contribute?

See the [Contributing guide](./community/contributing.md). Bugs, docs, translations and new agronomic modules are all welcome.

## Where do I report security issues?

**Do not** open a public issue. Email `security@agriromagna.example` (or open a private GitHub security advisory) with details. We'll respond within 72 hours.
