---
id: intro
slug: /intro
title: Introduction
sidebar_position: 1
description: AgriRomagna is an open-source farm cooperative management platform for Italian agriculture. Field journal, EU compliance, traceability, IoT, marketplace and governance in one Next.js stack.
---

# Introduction

**AgriRomagna** is an open-source SaaS platform for agricultural cooperatives and small farms — designed first for Emilia-Romagna, but applicable to any cooperative-driven agricultural region in the EU.

It collapses what is today a tangle of Excel spreadsheets, WhatsApp groups, paper compliance binders and disconnected vendor portals into **one coherent product**.

## What you get

A single Next.js application that covers ten farm-management domains out of the box:

| Domain | What it does |
|---|---|
| **Field & Crop** | Field mapping, crop planning, daily field journal, harvest declarations, yield prediction |
| **Compliance** | Organic, DOP/IGP and EU CAP audit packages auto-built from your operations log |
| **Traceability** | Product lots, supply-chain events, public QR pages, EU Digital Product Passport ready |
| **IoT & Satellite** | Sensor device registry, real-time readings, NDVI from Copernicus Sentinel-2 |
| **Financial** | Cost & revenue tracking, insurance policies, financial KPIs |
| **Sustainability** | Carbon accounting, ESG indicators, water management |
| **Intelligence** | AI advisor, anomaly detection, pest warnings, knowledge graph |
| **Cooperative** | Governance proposals & voting, communication hub, workforce scheduling |
| **Marketplace** | Direct B2B sales, orders, benchmarking |
| **Infrastructure** | Federation, ISOBUS/INSPIRE interoperability, telemetry |

## Who AgriRomagna is for

- **Agricultural cooperatives** managing 5–500 member farms — the platform is multi-tenant by design.
- **Independent farms** that need a digital field journal and weather/risk monitoring.
- **Cooperative IT teams and developers** who want a hackable open-source base instead of a closed vertical SaaS.
- **Researchers and policy teams** working on agricultural digitalization in the EU.

## What makes it different

1. **Cooperative-native.** Most farm SaaS is built for large US row-crop operations. AgriRomagna is built around the Italian co-op model: many small farms sharing logistics, certification and compliance.
2. **EU-first compliance.** Organic certification, DOP/IGP, CAP subsidies, and the upcoming Digital Product Passport are first-class objects, not afterthoughts.
3. **Offline-first.** Fields have spotty connectivity. The dashboard ships as a PWA with a service worker and local storage sync.
4. **Open-source and self-hostable.** A single `docker compose up` gives you the full platform on your own infrastructure with EU data residency.
5. **Built like a product, not a demo.** 36 Prisma models, ~50 REST endpoints, 67 unit tests, RFC 7807 error responses, RBAC across 6 roles.

## How the docs are organized

- **[Getting Started](./getting-started/install.md)** — get the platform running locally in under 5 minutes.
- **[Core Concepts](./concepts/architecture.md)** — the mental model: tenancy, RBAC, event bus, data layer.
- **[Guides](./guides/fields-and-crops.md)** — task-oriented walkthroughs for the main workflows.
- **[Reference](./reference/api.md)** — every endpoint, model and config knob.
- **[Operations](./operations/docker.md)** — Docker, deployment, observability.
- **[Troubleshooting](./troubleshooting.md)** and **[FAQ](./faq.md)** — when things go sideways.

## A note on stability

AgriRomagna is at version `0.1.x` and pre-1.0. The API surface is stable enough to build against, but breaking changes will be called out in the [changelog](./community/changelog.md) until 1.0. Pin a commit if you depend on the public API today.

Ready to go?

➡️ **[Install AgriRomagna locally](./getting-started/install.md)** or jump straight to the **[Quick Start](./getting-started/quick-start.md)**.
