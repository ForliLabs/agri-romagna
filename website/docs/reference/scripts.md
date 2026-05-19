---
id: scripts
title: npm Scripts
sidebar_position: 4
description: Every npm script in package.json — what it does, when to use it.
---

# npm Scripts

All scripts run from the project root.

## Development

| Script | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server on port 3000 with HMR. |
| `npm run lint` | Run ESLint over the codebase. |

## Production build

| Script | What it does |
|---|---|
| `npm run build` | Compile the production bundle (Next.js + standalone output). |
| `npm run start` | Start the production server. Run after `npm run build`. |

## Testing

| Script | What it does |
|---|---|
| `npm run test` | Run the full Vitest suite once. 67 tests across 8 suites. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run test:coverage` | Vitest with coverage report. |
| `npm run test:e2e` | Run Playwright end-to-end tests. |
| `npm run test:e2e:ui` | Playwright with the UI test runner. |

## Database

| Script | What it does |
|---|---|
| `npm run db:generate` | Generate the Prisma client into `src/generated/`. |
| `npm run db:migrate` | Apply pending migrations to the database. In dev, also prompts for a migration name on schema changes. |
| `npm run db:seed` | Load demo data from `prisma/seed-data/demo.json`. |
| `npm run db:reset` | Drop the database, re-apply all migrations, re-seed. **Destructive.** |

## Typical workflows

### First-time setup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### Pulling latest from main

```bash
git pull
npm install
npm run db:migrate
npm run dev
```

### Schema change

```bash
# edit prisma/schema.prisma
npm run db:migrate -- --name describe_change
# the Prisma client is regenerated automatically
npm run test
```

### Production deploy

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run build
npm run start
```
