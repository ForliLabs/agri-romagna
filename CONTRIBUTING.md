# Contributing to AgriRomagna

Grazie per il tuo interesse nel contribuire ad AgriRomagna! 🌾

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **SQLite** (bundled via `better-sqlite3`)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd agri-romagna

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Demo Credentials

| Email                | Password          | Role            |
| -------------------- | ----------------- | --------------- |
| marco@tondini.farm   | agriromagna2025   | coop_admin      |
| giulia@sanvittore.it | agriromagna2025   | member          |
| luca@lafratta.it     | agriromagna2025   | farmer          |
| anna@cabianca.farm   | agriromagna2025   | member          |

## Development Workflow

### Branch Naming

```
feature/<short-description>
fix/<short-description>
refactor/<short-description>
```

### Code Style

- **TypeScript** is required for all source files
- **ESLint** enforces code style — run `npm run lint` before committing
- Error messages and UI labels are in **Italian** to match the platform locale
- API errors follow **RFC 7807 Problem Details** (see `src/lib/api-errors.ts`)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # REST API endpoints (one folder per domain)
│   ├── dashboard/         # Protected dashboard pages
│   └── login/             # Authentication page
├── components/            # Reusable React components
├── generated/             # Prisma-generated client (auto-generated)
└── lib/                   # Shared utilities, services, and data layers
    ├── auth-service.ts    # JWT authentication (bcrypt + jsonwebtoken)
    ├── api-response.ts    # Response helpers + withAuth wrapper
    ├── api-errors.ts      # RFC 7807 error helpers + withErrorHandling
    ├── rbac-middleware.ts  # Role-based access control (70+ permissions)
    ├── data-layer.ts      # Prisma query abstraction layer
    ├── config.ts          # Zod-validated environment configuration
    └── validators/        # Zod request validation schemas
prisma/
├── schema.prisma          # Database schema (SQLite)
├── migrations/            # Prisma migration files
└── seed.ts                # Database seeding script
tests/
├── api/                   # API route integration tests
├── e2e/                   # Playwright end-to-end tests
└── lib/                   # Unit tests for library modules
```

### API Route Conventions

All API routes must be protected with authentication and RBAC unless explicitly public.

**Using `withAuth`** (preferred for simple routes):

```ts
import { withAuth, createSuccessResponse } from "@/lib/api-response";

export const GET = withAuth("fields:read", async (request, user) => {
  // `user` is the authenticated user with correct RBAC role
  return createSuccessResponse({ data: "..." });
});
```

**Using `authorizeRoute`** (for routes with dynamic params or complex logic):

```ts
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-errors";

export const GET = withErrorHandling(async (request, { params }) => {
  const { denied } = await authorizeRoute(request, "fields:read");
  if (denied) return denied;
  // ...
});
```

### Public routes (no auth required)

- `GET /api/health` — Health checks and probes
- `POST /api/auth` — Login, register, OTP, token refresh
- `GET /api/auth` — Current user info (self-validates token)
- `POST /api/onboarding` — Cooperative registration

## Testing

### Unit & Integration Tests (Vitest)

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run a specific test file
npx vitest run tests/api/routes.test.ts
```

### End-to-End Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Open interactive test UI
npm run test:e2e:ui
```

### Writing Tests

- Unit tests go in `tests/lib/` with the pattern `<module>.test.ts`
- API integration tests go in `tests/api/`
- E2E tests go in `tests/e2e/` with the pattern `<feature>.spec.ts`
- Mock `next/headers` and `@/lib/auth-service` for API route tests (see `tests/api/routes.test.ts`)

## Database

The project uses **SQLite** via Prisma with the `better-sqlite3` adapter.

```bash
# Generate the Prisma client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate

# Reset the database (drops all data)
npm run db:reset

# Seed the database
npm run db:seed
```

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` to create a migration
3. Run `npm run db:generate` to update the Prisma client
4. Update `prisma/seed.ts` if new models need seed data
5. Update `src/lib/data-layer.ts` with query helpers for new models

## Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t agri-romagna .
docker run -p 3000:3000 agri-romagna
```

## Pull Request Guidelines

1. Create a feature branch from `main`
2. Make focused, well-scoped changes
3. Ensure `npm run lint` and `npm test` pass
4. Write tests for new functionality
5. Update documentation if adding new API routes or features
6. Submit a PR with a clear description of changes
