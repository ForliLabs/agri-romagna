---
id: install
title: Installation
sidebar_position: 1
description: Install AgriRomagna locally with Node.js 20+ and npm 10+.
---

# Installation

AgriRomagna is a single Next.js 16 application with a SQLite-backed Prisma data layer. There are no external services to provision — the entire stack runs locally.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | ≥ 20 LTS | `node -v` to check |
| **npm** | ≥ 10 | Ships with modern Node |
| **Git** | any recent | To clone the repository |
| **Docker** _(optional)_ | ≥ 24 | Only needed for the containerized workflow |

:::tip macOS / Linux
If you use [`nvm`](https://github.com/nvm-sh/nvm), run `nvm install 20 && nvm use 20` before continuing.
:::

## Clone the repository

```bash
git clone https://github.com/ForliLabs/agri-romagna.git
cd agri-romagna
```

## Install dependencies

```bash
npm install
```

This installs ~450 packages including Next.js 16, React 19, Prisma 7 (with `better-sqlite3`), Tailwind 4, Zod 4 and Vitest 4.

## Configure environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env
```

The defaults work for local development. The variables you may want to change for any non-throwaway environment:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite file path. Use an absolute path in production. |
| `JWT_SECRET` | `agri-romagna-dev-secret-…` | **Change this in production.** |
| `NODE_ENV` | `development` | One of `development`, `production`, `test`. |
| `PORT` | `3000` | HTTP port for the Next.js server. |

See the full [configuration reference](../reference/configuration.md) for every supported variable.

## Initialize the database

Three commands, in order. They are idempotent — safe to re-run.

```bash
npm run db:generate    # generates the Prisma client into src/generated/
npm run db:migrate     # applies SQLite migrations
npm run db:seed        # loads demo cooperatives, farms, fields and users
```

The seed creates three cooperatives, eleven farms, demo users for every role, and enough records to make every dashboard panel non-empty.

## Verify the install

```bash
npm run test
```

You should see **67 tests passing** across 8 suites. If anything fails, jump to [Troubleshooting](../troubleshooting.md).

## You're ready

Continue with the [Quick Start](./quick-start.md) to launch the dev server and sign in.
