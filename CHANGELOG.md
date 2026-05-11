# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — Iteration 5: Production Polish & Launch Readiness

### Added
- MIT LICENSE file
- CHANGELOG.md documenting all iterations
- `.editorconfig` for consistent editor settings
- `CODEOWNERS` file for review assignment
- CodeQL security scanning GitHub Actions workflow
- Stricter ESLint rules (`no-explicit-any`, `no-unused-vars`)
- Structured logger integration in API error handler

### Changed
- Bumped TypeScript compilation target from ES2017 to ES2022
- Replaced `any` type in `insight-engine-data.ts` with `Record<string, unknown>`
- Replaced `console.error` in `api-errors.ts` with structured logger
- Migrated governance route from InMemoryStore to Prisma data layer
- Migrated marketplace route from InMemoryStore to Prisma data layer
- Migrated IoT route from InMemoryStore to Prisma data layer

## [0.4.0] — Iteration 4: Production Hardening & Deep Integration

### Added
- Prisma ORM with SQLite adapter and 36-model schema
- Data layer abstraction (`data-layer.ts`) with CRUD query factories
- RFC 7807 Problem Details error handling (`api-errors.ts`)
- Structured JSON logger with correlation IDs and child loggers
- API response standardization with `createSuccessResponse` and `withAuth`
- Zod validation schemas for API input (`validators/schemas.ts`)
- Rate limiter middleware
- Health monitor endpoint
- Webhook delivery system
- API versioning middleware
- Telemetry and observability module
- Event bus for cross-module communication
- Migration manager for schema evolution
- Docker and docker-compose configuration
- Dependabot configuration
- CI pipeline (lint, typecheck, test, build)
- PR template and issue templates
- CONTRIBUTING.md guide
- Comprehensive unit test suite (35+ test files)

### Changed
- Fields API route migrated from InMemoryStore to Prisma
- RBAC middleware enforces permissions on all API routes
- Auth service upgraded with JWT token validation

## [0.3.0] — Iteration 3: Advanced Capabilities & Market Differentiators

### Added
- Precision irrigation engine with water balance calculations
- Soil health analytics module
- Crop disease prediction with ML-ready rule engine
- Spray optimizer with drift-risk and weather-aware scheduling
- Yield prediction engine with multi-factor modeling
- Financial analytics (cost tracking, revenue, ROI analysis)
- Carbon footprint tracker with ESG indicators
- Insurance risk assessment module
- Equipment fleet management with maintenance scheduling
- Workforce and seasonal worker management
- Regulatory radar with compliance update monitoring
- Supply chain visibility and tracking
- Communication hub for cooperative messaging
- Knowledge graph data layer
- Field simulator for what-if scenarios
- Benchmarking engine for cross-farm comparisons

## [0.2.0] — Iteration 2: Cross-Feature Integration & Higher-Order Capabilities

### Added
- RBAC (Role-Based Access Control) with 4 roles and granular permissions
- Operations insights engine for cross-module dashboards
- Insight engine for natural-language data queries
- Analytics engine with aggregation pipelines
- Collaboration hub for team coordination
- Anomaly detection with threshold-based alerting
- Data export service (CSV, JSON, PDF)
- Compliance chain for end-to-end audit trail
- Federation data layer for multi-cooperative support
- Commercial intelligence and market analysis
- ESG reporting and sustainability metrics
- Mobile field data collection interface
- Onboarding wizard for new users
- Keyboard shortcuts and accessibility enhancements
- Offline data sync engine

## [0.1.0] — Iteration 1: Foundation & Core Features

### Added
- Next.js 16 application with App Router
- Landing page with pricing tiers
- Dashboard shell with navigation and overview
- PWA support with offline page and service worker
- Authentication system with JWT tokens and demo users
- Field registry and management (CRUD)
- Live weather service via Open-Meteo API
- Flood and hazard monitoring dashboard
- Harvest planning and scheduling
- Cooperative management interface
- EU CAP compliance engine with document tracking
- Satellite NDVI monitoring with crop health scoring
- Logistics route optimizer (greedy algorithm with Haversine)
- QR code traceability and Digital Product Passport builder
- AI crop advisor with rule-based recommendations
- Direct sales marketplace with products and orders
- IoT sensor hub with alert rules and MQTT configuration
- Tailwind CSS 4 styling system
- Responsive mobile-first layout
