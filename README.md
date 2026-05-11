# 🌾 AgriRomagna

**Farm Cooperative Management SaaS for Emilia-Romagna**

A comprehensive Next.js platform for Italian agricultural cooperatives — managing fields, compliance, traceability, IoT sensors, marketplace, governance, and 40+ additional modules from carbon tracking to AI advisory.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://prisma.io/)
[![Tests](https://img.shields.io/badge/tests-passing-green)]()
[![License](https://img.shields.io/badge/license-private-red)]()

---

## Overview

AgriRomagna is a multi-tenant SaaS platform designed for agricultural cooperatives in Italy's Emilia-Romagna region. It provides a unified dashboard covering the full lifecycle of cooperative farm management — from field planning and IoT sensor monitoring to EU compliance, supply-chain traceability, and carbon accounting.

### Key Capabilities

| Domain | Features |
|--------|----------|
| **Core Farm** | Field management, crop planning, harvest declarations, yield prediction |
| **Compliance** | EU regulatory tracking, compliance chain, audit packages, document management |
| **Supply Chain** | Lot traceability, digital product passports, supply-chain tracking |
| **IoT & Sensing** | Sensor device management, real-time readings, NDVI satellite data |
| **Financial** | Cost/revenue tracking, financial KPIs, insurance policies |
| **Sustainability** | Carbon accounting, ESG indicators, water management |
| **Intelligence** | AI advisor, anomaly detection, pest warnings, knowledge graph |
| **Cooperative** | Governance (proposals & voting), communication hub, workforce scheduling |
| **Marketplace** | Direct sales, order management, benchmarking |
| **Infrastructure** | Federation, data interoperability (ISOBUS, INSPIRE), analytics telemetry |

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Database:** SQLite via Prisma 7 + better-sqlite3
- **Auth:** JWT (access + refresh tokens) + bcrypt password hashing
- **Validation:** Zod 4
- **UI:** React 19, Tailwind CSS 4, Lucide icons
- **Testing:** Vitest 4 (67 unit tests across 8 test suites)
- **Deployment:** Docker multi-stage build + Docker Compose

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
# Clone and install
git clone <repo-url> && cd agri-romagna
npm install

# Generate Prisma client + run migrations + seed demo data
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

### Demo Credentials

The seed script creates demo users for each role. Check `prisma/seed.ts` for exact credentials.

### Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Or build the image directly
docker build -t agri-romagna .
docker run -p 3000:3000 agri-romagna
```

---

## Project Structure

```
agri-romagna/
├── prisma/
│   ├── schema.prisma          # 36 data models
│   ├── migrations/            # SQLite migrations
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/               # ~50 API route handlers (32 domains)
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── login/             # Auth pages
│   │   ├── onboarding/        # Cooperative onboarding flow
│   │   └── traceability/      # Public traceability viewer
│   ├── components/            # React components (navbar, dashboard, etc.)
│   ├── lib/                   # Core business logic (45+ modules)
│   │   ├── auth-service.ts    # JWT auth + bcrypt
│   │   ├── rbac-middleware.ts # 7 roles, 70+ permissions
│   │   ├── data-layer.ts      # Prisma query layer (36 model accessors)
│   │   ├── event-bus.ts       # Cross-module event system
│   │   ├── api-errors.ts      # RFC 7807 error responses
│   │   ├── telemetry.ts       # Request/feature telemetry
│   │   └── validators/        # Zod schemas
│   ├── generated/             # Prisma generated client
│   └── middleware.ts          # Next.js edge auth middleware
├── tests/
│   └── lib/                   # 8 test suites, 67 test cases
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Single-service deployment
└── vitest.config.ts           # Test configuration
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset database (drop + migrate + seed) |

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture diagrams and data flow documentation.

### High-Level Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│  API Routes  │────▶│   Prisma    │
│  Frontend   │     │  (32 domains)│     │  (SQLite)   │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │  Middleware   │
                    │  JWT + RBAC  │
                    └──────────────┘
```

### Authentication Flow

1. Edge middleware checks token presence on every request
2. Public paths (`/`, `/login`, `/api/auth`, `/api/health`, `/traceability`) skip auth
3. API routes without token → 401 JSON response
4. Dashboard routes without token → redirect to `/login`
5. Route handlers validate JWT and check RBAC permissions

### Data Architecture

- **36 Prisma models** covering users, cooperatives, farms, fields, compliance, IoT, financial, marketplace, governance, and more
- **Dual data layer:** Prisma-backed `data-layer.ts` for persistent data + `InMemoryStore<T>` for ephemeral/demo data
- **Cross-module event bus** connecting 15 event flows between modules

---

## API Reference

See [docs/API.md](docs/API.md) for the full API reference with all 50 endpoints.

---

## Testing

```bash
# Run all 67 tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Suites

| Suite | File | Coverage |
|-------|------|----------|
| Auth Service | `tests/lib/auth-service.test.ts` | JWT, bcrypt, login, register, token refresh |
| RBAC Middleware | `tests/lib/rbac-middleware.test.ts` | Permissions, role hierarchy, route gating |
| Event Bus | `tests/lib/event-bus.test.ts` | Pub/sub, circuit breaker, event flows |
| Telemetry | `tests/lib/telemetry.test.ts` | Metrics, percentiles, feature heatmap |
| In-Memory DB | `tests/lib/db.test.ts` | CRUD operations, filtering |
| Validators | `tests/lib/validators.test.ts` | Zod schema validation |
| Utils | `tests/lib/utils.test.ts` | Class name merging |
| Moonshot OS | `tests/lib/moonshot-operating-system.test.ts` | Intelligence fabric, GDD, NDVI |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `JWT_SECRET` | `agri-romagna-dev-secret-...` | JWT signing secret (**change in production**) |
| `NODE_ENV` | `development` | Environment (`development`, `production`, `test`) |
| `PORT` | `3000` | Server port |

---

## License

Private — All rights reserved.
