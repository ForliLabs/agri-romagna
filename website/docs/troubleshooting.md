---
id: troubleshooting
title: Troubleshooting
sidebar_position: 90
description: Common AgriRomagna install, runtime and deployment issues, with fixes.
---

# Troubleshooting

Reach for this page when something goes wrong. If your issue isn't here, open a [GitHub Discussion](https://github.com/ForliLabs/agri-romagna/discussions) with the failing command and the full output.

## Install & build

### `npm install` fails with `better-sqlite3` build errors

`better-sqlite3` is a native module and needs build tools.

- **macOS**: `xcode-select --install`
- **Debian/Ubuntu**: `sudo apt-get install build-essential python3`
- **Alpine**: already covered by our Dockerfile (`apk add --no-cache build-base python3`).

Then `rm -rf node_modules package-lock.json && npm install`.

### `npm run build` reports "Module not found: @/generated/prisma/client"

You forgot to generate the Prisma client.

```bash
npm run db:generate
npm run build
```

### TypeScript errors after a `git pull`

The Prisma client output is gitignored. Regenerate:

```bash
npm run db:generate
```

## Database

### "Table … does not exist" on first run

Migrations haven't been applied. Run:

```bash
npm run db:migrate
```

### Seed fails with "Unique constraint failed"

Either:

- the database already has data — `npm run db:reset` to start clean, or
- you're seeding twice in a row — the seed is intentionally non-idempotent for safety.

### `database is locked` errors at runtime

SQLite supports **one writer at a time**. This error appears if multiple processes write to the same file concurrently. Make sure only **one** Next.js process is touching the database. If you want concurrency, deploy one container per cooperative.

## Auth

### `POST /api/auth` always returns 401

- Verify the user exists: `superadmin@agriromagna.demo` and the others from [demo login](./getting-started/demo-login.md).
- Local-only password: `demo`. Run `npm run db:seed` if you haven't.
- For your own users: bcrypt-hashed passwords are required; the seed uses a placeholder hash for demo users.

### Token expired mid-session

The dashboard refreshes tokens automatically. For programmatic clients:

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"refresh","refreshToken":"<refreshToken>"}'
```

## Dashboard

### "Loading…" forever on a dashboard page

Open the network tab. The most common causes:

- `403 Forbidden`: your role doesn't have access to that resource. See [Roles & Permissions](./reference/roles-and-permissions.md).
- `404 Not Found`: the resource id in the URL doesn't belong to your cooperative.
- `500 Internal Server Error`: check server logs and grab the `X-Correlation-Id`.

### Service worker keeps serving stale data

Open Chrome DevTools → **Application → Service Workers → Unregister**, then hard-reload. The service worker only registers on production builds; in dev (`npm run dev`) it should not be present.

## Production

### "Your connection is not secure" after deploying

Make sure your reverse proxy is terminating TLS with a valid certificate. AgriRomagna itself listens on plain HTTP and expects to sit behind a proxy.

### QR codes point to `localhost`

Set `PUBLIC_BASE_URL` to your public hostname:

```bash
PUBLIC_BASE_URL="https://coop-vigne-romagna.example.it"
```

Restart the process. New QR codes will use the correct URL; previously-generated QR codes still encode the old URL.

### `/api/health?strict=1` returns 503

One of: database not reachable, object storage credentials wrong, or weather provider down. Inspect the `checks` field in the response.

## Tests

### Vitest crashes with "Cannot find module"

You probably skipped `npm run db:generate`. Tests import the Prisma client.

### Coverage report is empty

Coverage requires v8 coverage:

```bash
npm run test:coverage
```

If you've installed Vitest globally with a different version, run via `npx`:

```bash
npx vitest run --coverage
```

## Still stuck?

Open a [GitHub issue](https://github.com/ForliLabs/agri-romagna/issues/new/choose) with:

- the command you ran;
- the full error output (including `X-Correlation-Id` if applicable);
- `node --version`, `npm --version`, OS and architecture;
- whether you're using Docker or running directly.
