# DEPTH-AUDIT

## Rubrica
- 🔴 **Stub / fragile** — flusso incompleto, contratto incoerente o UX che interrompe il task.
- 🟡 **Shallow** — presente ma poco affidabile, poco guidato o con profondità limitata.
- 🟢 **Solid** — esperienza coerente, credibile e sufficientemente robusta per la demo.

## Executive summary
Il progetto era forte sulla quantità di superfici coperte, ma non sulla profondità operativa: autenticazione incoerente, onboarding poco guidato, diverse pagine con placeholder visivi e alcune API che restituivano shape incompatibili con i modelli usati dalla UI.

In questa passata sono stati corretti tutti i punti classificati come 🔴 e 🟡 sotto. Il risultato finale compila, i test passano e il lint non presenta errori bloccanti.

## Audit per area

### 1. Autenticazione e accesso
- ✅ **P0 · 🔴 Cookie/session mismatch**
  - **Problema:** il login usava `localStorage`, mentre protezione route e middleware controllavano il cookie `access_token`.
  - **Impatto:** login apparentemente riuscito ma sessione non affidabile.
  - **Fix:** login e refresh portati su cookie HTTP; flusso OTP demo implementato; onboarding reso pubblico; redirect post-login preservato.
  - **File:** `src/app/login/page.tsx`, `src/app/api/auth/route.ts`, `src/proxy.ts`, `src/lib/auth-service.ts`

- ✅ **P1 · 🟡 Primo accesso poco guidato**
  - **Problema:** onboarding lineare ma poco validato, senza checklist, conferme o feedback robusti.
  - **Fix:** wizard multi-step con validazione per step, checklist di attivazione, dialog di conferma per dati demo, toast e stato di completamento più chiaro.
  - **File:** `src/app/onboarding/page.tsx`, `src/components/confirm-dialog.tsx`, `src/components/toast-provider.tsx`

### 2. Dashboard UX e navigazione
- ✅ **P1 · 🟡 IA piatta e mobile drawer fragile**
  - **Problema:** navigazione dashboard troppo lunga, scarsa priorità visiva, drawer mobile poco accessibile.
  - **Fix:** raggruppamento per sezioni/priorità, ricerca moduli, drawer con gestione focus/tastiera, indicatori meno dipendenti dal solo colore.
  - **File:** `src/components/dashboard.tsx`, `src/app/dashboard/layout.tsx`, `src/lib/focus-management.ts`

- ✅ **P1 · 🟡 Stati di loading/error/empty non uniformi**
  - **Problema:** molte pagine restituivano solo testo grezzo o nessun fallback.
  - **Fix:** introdotti skeleton, empty/error states condivisi, `dashboard/loading.tsx`, `dashboard/error.tsx`, `global-error.tsx`, toast globali.
  - **File:** `src/components/ui/states.tsx`, `src/app/dashboard/loading.tsx`, `src/app/dashboard/error.tsx`, `src/app/global-error.tsx`, `src/app/dashboard/analytics/page.tsx`

### 3. Profondità funzionale delle feature
- ✅ **P0 · 🔴 Esperienze placeholder in aree chiave**
  - **Problema:** advisor, satellite, traceability, marketplace e fields avevano componenti fittizi o segnaposto poco credibili.
  - **Fix:** advisor collegato alle API con loading/error/retry; preview mappa campi; badge QR deterministico; artwork prodotto; copy e struttura dei dettagli migliorati.
  - **File:** `src/app/dashboard/advisor/page.tsx`, `src/app/dashboard/satellite/page.tsx`, `src/app/dashboard/traceability/page.tsx`, `src/app/traceability/[lotId]/page.tsx`, `src/app/dashboard/marketplace/page.tsx`, `src/app/dashboard/fields/page.tsx`, `src/components/field-map-preview.tsx`, `src/components/qr-badge.tsx`, `src/components/product-artwork.tsx`

- ✅ **P1 · 🟡 Homepage e ingressi poco orientati al task**
  - **Problema:** CTA principale spingeva subito al dashboard senza distinguere accesso e setup iniziale.
  - **Fix:** CTA riorientate su login/onboarding, messaggio esplicito per primo accesso.
  - **File:** `src/app/page.tsx`, `src/components/navbar.tsx`

### 4. Contratti API e coerenza dati
- ✅ **P0 · 🔴 API con shape incoerenti rispetto alla UI**
  - **Problema:** alcune route restituivano record Prisma parziali o shape divergenti rispetto ai modelli usati nelle feature, con rischio di payload inconsistenti e profondità solo apparente.
  - **Fix:** route ricondotte a store/modelli tipizzati coerenti con la UI oppure tipizzate in modo esplicito; rimosso l'uso bloccante di `any`; resi consistenti carbon, financial, governance, marketplace, iot, pest-warning, supply-chain, yield prediction e compliance.
  - **File:** `src/app/api/benchmarking/route.ts`, `src/app/api/carbon/route.ts`, `src/app/api/compliance/route.ts`, `src/app/api/financial/route.ts`, `src/app/api/governance/route.ts`, `src/app/api/iot/route.ts`, `src/app/api/marketplace/route.ts`, `src/app/api/pest-warning/route.ts`, `src/app/api/supply-chain/route.ts`, `src/app/api/yield-prediction/route.ts`

### 5. Accessibilità e robustezza del shell
- ✅ **P1 · 🟡 Accessibilità globale incompleta**
  - **Problema:** skip link, focus-visible, semantica errori e timeline pubblica erano incompleti o assenti.
  - **Fix:** skip link, miglior focus styling, error boundary accessibile, timeline semantica, labeling migliore per grafici/elementi visuali.
  - **File:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/error-boundary.tsx`, `src/app/traceability/[lotId]/page.tsx`, `src/app/dashboard/weather/page.tsx`

## Aree oggi classificate 🟢
- 🟢 **P2 · Shell applicativa** — layout, toast, error handling e loading condivisi ora sono coerenti.
- 🟢 **P2 · Flusso login/onboarding** — accesso email + OTP demo e setup cooperativa sono credibili per una demo operativa.
- 🟢 **P2 · Feature showcase principali** — advisor, traceability, satellite, marketplace e fields non sono più mere vetrine statiche.
- 🟢 **P3 · Build hygiene** — progetto validato con lint/test/build dopo le modifiche.

## Residui non bloccanti
- 🟢 **P3 · Warning lint residui** in moduli dashboard non toccati funzionalmente (principalmente import/local variabili inutilizzati).
- 🟢 **P3 · Persistenza completa**: diverse aree usano ancora store in-memory orientati alla demo; non bloccano la build né i flussi corretti in questa passata, ma un consolidamento end-to-end su persistenza reale resta una futura evoluzione.

## Validazione finale
- `npm run lint` ✅ (solo warning non bloccanti)
- `npm run test` ✅
- `npm run build` ✅
