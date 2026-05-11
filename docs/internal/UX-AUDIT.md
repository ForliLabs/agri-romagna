# UX Audit — AgriRomagna

## Scope reviewed
- Marketing entry points: `/`, `/login`, `/onboarding`, `/offline`, public traceability.
- Dashboard shell: `src/app/dashboard/layout.tsx`, `src/components/dashboard.tsx`, `src/components/error-boundary.tsx`, `src/components/navbar.tsx`.
- Core product pages: all routes under `src/app/dashboard/**/page.tsx`.
- Supporting APIs and auth flow where UX defects originate.

## Critical

### 1. Authentication flow breaks after successful login
- **Area:** `src/app/login/page.tsx`, `src/app/api/auth/route.ts`, `src/middleware.ts`
- **Issue:** login stores the token only in `localStorage`, while middleware protects routes using the `access_token` cookie.
- **Impact:** users can authenticate and still be redirected back to `/login`.
- **Fix:** switch to cookie-backed auth and remove client-side token persistence.

### 2. Demo credentials are exposed in the login UI
- **Area:** `src/app/login/page.tsx`
- **Issue:** production-facing UI displays a plaintext demo email and password.
- **Impact:** trust and security concern, especially on first run.
- **Fix:** hide credentials outside development or replace with a safe demo-access CTA.

## High-impact

### 3. Navigation is too dense and unstructured
- **Area:** `src/app/dashboard/layout.tsx`, `src/components/dashboard.tsx`
- **Issue:** 40+ destinations are rendered as a flat list with no grouping or search.
- **Impact:** hard to learn, hard to scan, especially on mobile.
- **Fix:** introduce grouped navigation, a compact “core workflows” section, and sidebar search.

### 4. Missing route-level loading and error states
- **Area:** most `src/app/dashboard/**/page.tsx`
- **Issue:** pages render static UI immediately and lack shared loading, empty, and retry states.
- **Impact:** async transitions feel broken and failures are silent.
- **Fix:** add `loading.tsx`, `error.tsx`, shared skeletons, and empty-state components.

### 5. Mobile navigation is not keyboard safe
- **Area:** `src/components/dashboard.tsx`, `src/components/navbar.tsx`
- **Issue:** drawer/menu lacks focus trap, escape handling, and focus restoration.
- **Impact:** keyboard and assistive-tech navigation is unreliable.
- **Fix:** implement dialog-style menu behavior with explicit focus management.

### 6. Forms rely on submit-time generic errors
- **Area:** `src/app/login/page.tsx`, `src/app/onboarding/page.tsx`
- **Issue:** required fields have no step-level or field-level validation messaging.
- **Impact:** users do not know what is invalid or why they cannot proceed.
- **Fix:** add inline validation, disabled-next states, `aria-invalid`, and helpful helper text.

### 7. Feedback patterns are inconsistent
- **Area:** dashboard pages, onboarding, auth, API error toast
- **Issue:** success, pending, and failure feedback varies per screen; many actions have no visible confirmation.
- **Impact:** low confidence in submissions and system status.
- **Fix:** standardize toasts, retry affordances, and success messaging.

### 8. Accessibility baseline is incomplete
- **Area:** global styles and interactive components
- **Issue:** no skip link, global links lose underlines, focus styling is inconsistent, tabs/toasts lack ARIA semantics.
- **Impact:** keyboard and screen-reader use is weaker than expected.
- **Fix:** add skip link, `focus-visible` styling, semantic tabs, live regions, and accessible labels.

### 9. Data-dense screens do not adapt well to small screens
- **Area:** fields, finance, compliance, workforce, logistics, analytics
- **Issue:** wide tables/cards stack inconsistently and some views remain hard to scan on mobile.
- **Impact:** operational pages are cumbersome in the field.
- **Fix:** use responsive cards/tables, horizontal scroll wrappers, and mobile-first spacing.

### 10. First-run experience is under-guided
- **Area:** `/onboarding`, `/dashboard`
- **Issue:** little setup guidance, empty-state education, or “what to do next” direction.
- **Impact:** users land in a feature-heavy product without a clear activation path.
- **Fix:** add setup checklist, contextual empty states, and a primary first-run CTA.

## Polish

### 11. Typography and spacing vary slightly across product areas
- **Area:** dashboard pages and marketing pages
- **Issue:** repeated page-level card/table styles drift in padding, headings, and density.
- **Impact:** the app feels assembled from modules instead of a unified SaaS.
- **Fix:** standardize layout primitives for sections, cards, headings, and metrics.

### 12. Several visual indicators rely too much on color
- **Area:** stat changes, bars, status chips, charts
- **Issue:** positive/negative states often depend primarily on color.
- **Impact:** weaker readability and accessibility.
- **Fix:** pair color with text, icons, or arrows.

### 13. Placeholder interactions leak into production-facing UI
- **Area:** advisor chat, satellite/field visualizations, QR previews, product imagery
- **Issue:** “placeholder” experiences are shown without clear messaging.
- **Impact:** lowers product trust.
- **Fix:** replace with meaningful states, simplified working versions, or explicit “coming soon” messaging.

## Implementation priorities
1. P0 — auth cookie flow, login safety, route loading/error coverage, keyboard-safe navigation.
2. P1 — form validation, toasts, empty states, responsive tables/cards.
3. P2 — grouped navigation, spacing/typography primitives, accessible tabs and charts.
4. P3 — richer first-run guidance and deeper micro-interactions.
