---
id: quick-start
title: Quick Start
sidebar_position: 2
description: Get the AgriRomagna dashboard running and signed in in under 5 minutes.
---

# Quick Start

This walkthrough takes a fresh machine to a signed-in, fully-seeded dashboard in **under 5 minutes**.

## 1. Clone, install, seed

```bash
git clone https://github.com/ForliLabs/agri-romagna.git
cd agri-romagna
npm install
cp .env.example .env

npm run db:generate
npm run db:migrate
npm run db:seed
```

## 2. Start the dev server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

You'll land on the public marketing page. Click **Login** in the navbar.

## 3. Sign in as the cooperative admin

Use the demo cooperative admin from the seed:

```text
Email:    elena.bellini@vignediromagna.it
Password: demo
```

:::note Seed credentials
The seed script (`prisma/seed.ts`) creates demo users for every role — `superadmin`, `cooperative_admin`, `farm_manager`, `agronomist`, `seasonal_worker`, `buyer`. All use the same demo password during local development. See [Demo login](./demo-login.md) for the full list.
:::

## 4. Take the tour

You're now in the dashboard for **Cooperativa Vigne di Romagna**. Try these in order:

1. **Fields** → see the seeded vineyards on the map.
2. **Compliance** → open the latest organic audit package.
3. **IoT** → inspect soil moisture readings streaming from `sensor-01`.
4. **Marketplace** → browse the public B2B catalog.
5. **Governance** → vote on the open proposal.

## 5. Hit the API directly

Every dashboard panel is backed by a typed REST endpoint. Authenticate once, then call any endpoint:

```bash
# Login and capture the token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"elena.bellini@vignediromagna.it","password":"demo"}' \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).tokens.accessToken))')

# Call a protected endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/fields
```

You'll get back a JSON list of the cooperative's fields.

## What's next

- **[Add your first real field →](./first-field.md)** — replace seed data with your own.
- **[Architecture overview →](../concepts/architecture.md)** — understand how the pieces fit.
- **[API reference →](../reference/api.md)** — every endpoint with examples.
