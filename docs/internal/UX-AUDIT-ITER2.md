# UX Audit — AgriRomagna (Iteration 2)

## Scope reviewed
- `/dashboard/fields`
- `/dashboard/weather`
- `/dashboard/harvest`
- `/dashboard/logistics`
- `/dashboard/traceability`
- `/dashboard/iot`
- `/dashboard/marketplace`

## New issues found in iteration 2

### 1. Field workflow still lacked a true next-step queue
- **Area:** `src/app/dashboard/fields/page.tsx`
- **Issue:** the page exposed tables and notes, but operators still had to infer what to do next from free text.
- **Impact:** weak field-to-action handoff between agronomy, meteo, raccolta and IoT.
- **Fix implemented:** added KPI cards, a “Priorità di oggi” queue, per-field next actions, and linked modules powered by `src/lib/operations-insights.ts`.
- **Files:** `src/app/dashboard/fields/page.tsx`, `src/lib/operations-insights.ts`

### 2. Weather dashboard was informative but not operational
- **Area:** `src/app/dashboard/weather/page.tsx`
- **Issue:** forecast, river and alerts were visible, but there was no workflow-level recommendation for spray, harvest, logistics or irrigation.
- **Impact:** planners still had to translate weather data into decisions manually.
- **Fix implemented:** added current-state summary cards plus workflow windows with recommended timing, rationale and deep-links to dependent modules.
- **Files:** `src/app/dashboard/weather/page.tsx`, `src/lib/operations-insights.ts`

### 3. Harvest planning still hid readiness and blockers
- **Area:** `src/app/dashboard/harvest/page.tsx`
- **Issue:** calendar and crew views did not expose which lots were actually ready, what was blocked, or which vehicle plan was implied.
- **Impact:** confirmation happened too late and cross-team coordination stayed brittle.
- **Fix implemented:** added readiness scoring, blocker lists, recommended vehicle plans, destination context, and crew load summaries.
- **Files:** `src/app/dashboard/harvest/page.tsx`, `src/lib/operations-insights.ts`

### 4. Cooperative logistics still masked assignment gaps
- **Area:** `src/app/dashboard/logistics/page.tsx`
- **Issue:** the optimized route looked good, but the screen did not surface which declarations needed immediate dispatch attention or which supply-chain lots still had no route.
- **Impact:** planners could miss unassigned cold-chain or premium lots.
- **Fix implemented:** added a dispatch board, capacity KPIs, and a dedicated “Lotti da instradare” panel for missing route links.
- **Files:** `src/app/dashboard/logistics/page.tsx`, `src/lib/operations-insights.ts`

### 5. Traceability UI still hid chain completeness
- **Area:** `src/app/dashboard/traceability/page.tsx`
- **Issue:** lot cards showed QR and events but did not reveal missing phases, verification coverage or quality attachment gaps.
- **Impact:** incomplete DPP chains looked healthier than they actually were.
- **Fix implemented:** added an integrity board, per-lot completeness meters, missing-phase disclosure and clearer quality/verification context.
- **Files:** `src/app/dashboard/traceability/page.tsx`, `src/lib/operations-insights.ts`

### 6. IoT monitoring remained device-centric instead of operations-centric
- **Area:** `src/app/dashboard/iot/page.tsx`
- **Issue:** the screen showed sensor cards, but not area health, intervention backlog or transport-critical monitoring at a glance.
- **Impact:** operators had to scan every card to understand where to intervene first.
- **Fix implemented:** added “Salute per area”, a backlog panel, and precomputed sensor histories to keep sparkline rendering lightweight.
- **Files:** `src/app/dashboard/iot/page.tsx`, `src/lib/operations-insights.ts`

### 7. Marketplace UX still lacked fulfillment and stock urgency
- **Area:** `src/app/dashboard/marketplace/page.tsx`
- **Issue:** catalog and orders were visible, but the page did not prioritize what to prepare now, what stock was risky, or how channels were performing.
- **Impact:** direct-sales operations stayed reactive instead of queue-driven.
- **Fix implemented:** added a fulfillment queue, stock/shelf-life alerts, channel mix cards and traceability/logistics cross-links.
- **Files:** `src/app/dashboard/marketplace/page.tsx`, `src/lib/operations-insights.ts`

## Outcome
All new UX findings above were implemented in this iteration. Within the reviewed scope, no remaining 🔴/🟡 UX issues were left open after the changes.

## Validation
- `npm run lint` ✅ (warnings only, no errors)
- `npm run test` ✅
- `npm run build` ✅
