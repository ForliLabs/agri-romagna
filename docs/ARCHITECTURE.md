# Architecture Overview

AgriRomagna is a full-stack Next.js 16 application using the App Router pattern. It serves both a React-based dashboard UI and a comprehensive REST API, all backed by SQLite through Prisma ORM.

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Browser / Mobile"]
        UI[React Dashboard]
        SW[Service Worker<br/>Offline Support]
    end

    subgraph Edge["Next.js Edge Runtime"]
        MW[Middleware<br/>Auth Gate]
    end

    subgraph Server["Next.js Server"]
        subgraph API["API Layer (32 Domains)"]
            AUTH["/api/auth"]
            FIELDS["/api/fields"]
            IOT["/api/iot"]
            MARKET["/api/marketplace"]
            COMPLY["/api/compliance"]
            TRACE["/api/traceability"]
            MORE["... 26 more domains"]
        end

        subgraph Core["Core Services"]
            AUTH_SVC[Auth Service<br/>JWT + bcrypt]
            RBAC[RBAC Middleware<br/>7 roles, 70+ perms]
            ERRORS[API Errors<br/>RFC 7807]
            VALID[Validators<br/>Zod schemas]
            TELEM[Telemetry<br/>Metrics collector]
        end

        subgraph Intelligence["Intelligence Layer"]
            EBUS[Event Bus<br/>15 event flows]
            ADVISOR[AI Advisor<br/>Rule-based]
            YIELD[Yield Prediction<br/>Phenology models]
            WEATHER[Weather Service<br/>Forecast + alerts]
            ANOMALY[Anomaly Detection]
        end

        subgraph Data["Data Layer"]
            DL[data-layer.ts<br/>36 model accessors]
            IMS[InMemoryStore<br/>Ephemeral data]
            PRISMA[Prisma Client<br/>better-sqlite3]
        end
    end

    subgraph Storage["Storage"]
        DB[(SQLite<br/>dev.db)]
    end

    UI --> MW
    SW --> MW
    MW --> API
    API --> AUTH_SVC
    API --> RBAC
    API --> ERRORS
    API --> VALID
    API --> TELEM
    API --> EBUS
    API --> DL
    API --> IMS
    DL --> PRISMA
    PRISMA --> DB
    EBUS --> ADVISOR
    EBUS --> YIELD
    EBUS --> WEATHER
    EBUS --> ANOMALY
```

---

## Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant MW as Edge Middleware
    participant R as Route Handler
    participant AS as Auth Service
    participant RBAC as RBAC Middleware
    participant DB as Database

    C->>MW: Request with Bearer token / cookie
    
    alt Public path (/, /login, /api/auth, /api/health)
        MW->>R: Pass through
    else No token + API route
        MW-->>C: 401 Unauthorized (JSON)
    else No token + Dashboard
        MW-->>C: 302 Redirect to /login
    else Has token
        MW->>R: Forward request
    end

    R->>AS: getUserFromRequest(request)
    AS->>AS: Extract token from header/cookie
    
    alt Legacy demo token
        AS->>DB: Find user by ID
    else JWT token
        AS->>AS: verifyToken(jwt)
        AS->>DB: Find user by userId
    end
    
    AS-->>R: AuthUser | null

    R->>RBAC: requirePermission(user, permission)
    
    alt No user
        RBAC-->>C: 401 Unauthorized
    else Missing permission
        RBAC-->>C: 403 Forbidden
    else Authorized
        RBAC-->>R: null (proceed)
        R->>DB: Execute query
        R-->>C: 200 Response
    end
```

### JWT Token Lifecycle

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 15 minutes | API request authentication |
| Refresh Token | 7 days | Renew access tokens without re-login |

### RBAC Role Hierarchy

```mermaid
graph TD
    SA[superadmin<br/>Level 100] --> CA[cooperative_admin<br/>Level 80]
    CA --> FM[farm_manager<br/>Level 60]
    FM --> AG[agronomist<br/>Level 50]
    AG --> SW2[seasonal_worker<br/>Level 20]
    CA --> BU[buyer<br/>Level 15]
    SW2 --> VI[viewer<br/>Level 10]
    BU --> VI

    style SA fill:#e74c3c,color:#fff
    style CA fill:#e67e22,color:#fff
    style FM fill:#f39c12,color:#fff
    style AG fill:#27ae60,color:#fff
    style SW2 fill:#3498db,color:#fff
    style BU fill:#9b59b6,color:#fff
    style VI fill:#95a5a6,color:#fff
```

**Permission count by role:**
- `superadmin` — all 70+ permissions (read + write)
- `cooperative_admin` — all read + most write (no `rbac:write`, `users:write`)
- `farm_manager` — farm-scope read/write
- `agronomist` — field-scope agronomic features
- `seasonal_worker` — harvest, mobile, communication
- `buyer` — marketplace, traceability
- `viewer` — dashboard, fields, weather, satellite, marketplace (read-only)

---

## Data Model

### Entity Relationship Overview

```mermaid
erDiagram
    Cooperative ||--o{ User : "has members"
    Cooperative ||--o{ Farm : "contains"
    Cooperative ||--o{ ESGIndicator : "tracks"
    Cooperative ||--o{ SeasonalWorker : "employs"
    Cooperative ||--o{ Proposal : "governs"
    Cooperative ||--o{ CommunicationChannel : "communicates"

    Farm ||--o{ Field : "has"
    Farm ||--o{ User : "assigned to"
    Farm ||--o{ CostEntry : "tracks costs"
    Farm ||--o{ RevenueEntry : "tracks revenue"
    Farm ||--o{ CarbonEntry : "carbon accounting"
    Farm ||--o{ Equipment : "owns"
    Farm ||--o{ MarketplaceProduct : "sells"
    Farm ||--o{ InsurancePolicy : "insured by"
    Farm ||--o{ FarmBenchmark : "benchmarked"

    Field ||--o{ ComplianceRecord : "regulated by"
    Field ||--o{ ComplianceEvent : "events"
    Field ||--o{ ProductLot : "produces"
    Field ||--o{ SensorDevice : "monitored by"
    Field ||--o{ NDVIReading : "satellite data"
    Field ||--o{ CostEntry : "field costs"
    Field ||--o{ CarbonEntry : "field carbon"
    Field ||--o{ HarvestDeclaration : "harvested"
    Field ||--o{ IrrigationSchedule : "irrigated"
    Field ||--o{ SoilAnalysis : "analyzed"
    Field ||--o{ SprayPrescription : "treated"
    Field ||--o{ WorkShift : "worked on"
    Field ||--o{ YieldPrediction : "predicted"
    Field ||--o{ SimulationScenario : "simulated"

    User ||--o{ Proposal : "creates"
    User ||--o{ Vote : "votes"
    User ||--o{ Order : "buys"
    User ||--o{ Message : "sends"
    User ||--o{ SimulationScenario : "simulates"

    ProductLot ||--o{ TraceabilityEvent : "traced"
    SensorDevice ||--o{ SensorReading : "reads"
    Equipment ||--o{ MaintenanceEvent : "maintained"
    SeasonalWorker ||--o{ WorkShift : "works"
    Proposal ||--o{ Vote : "receives"
    MarketplaceProduct ||--o{ Order : "ordered"
    CommunicationChannel ||--o{ Message : "contains"
    ComplianceRecord ||--o{ ComplianceEvent : "has events"
```

### Model Count by Domain

| Domain | Models | Key Tables |
|--------|--------|------------|
| Core | 4 | User, Cooperative, Farm, Field |
| Compliance | 2 | ComplianceRecord, ComplianceEvent |
| Traceability | 2 | ProductLot, TraceabilityEvent |
| IoT | 3 | SensorDevice, SensorReading, NDVIReading |
| Financial | 3 | CostEntry, RevenueEntry, FarmBenchmark |
| Carbon & ESG | 2 | CarbonEntry, ESGIndicator |
| Water & Soil | 2 | IrrigationSchedule, SoilAnalysis |
| Crop Protection | 2 | DiseaseRisk, SprayPrescription |
| Equipment | 2 | Equipment, MaintenanceEvent |
| Workforce | 3 | SeasonalWorker, WorkShift, HarvestDeclaration |
| Governance | 2 | Proposal, Vote |
| Marketplace | 2 | MarketplaceProduct, Order |
| Logistics | 1 | SupplyChainLot |
| Communication | 2 | CommunicationChannel, Message |
| Insurance | 1 | InsurancePolicy |
| Predictions | 2 | YieldPrediction, SimulationScenario |
| Regulatory | 1 | RegulatoryUpdate |

**Total: 36 models**

---

## Cross-Module Event Bus

The event bus implements a publish-subscribe pattern connecting modules via 15 predefined event flows. It includes circuit breaker logic and recursion depth limits.

```mermaid
graph LR
    subgraph Producers
        W[Weather]
        IOT2[IoT Sensors]
        H[Harvest]
        FLD[Fields]
        CMP[Compliance]
        MKT[Marketplace]
        CB[Carbon]
        REG[Regulatory]
        YP[Yield Prediction]
        PW[Pest Warning]
        SC[Supply Chain]
        ESG2[ESG]
        WF[Workforce]
        EQ[Equipment]
    end

    subgraph EventBus["Cross-Module Event Bus"]
        EB((Event Bus<br/>Circuit Breaker<br/>Max Depth: 5))
    end

    subgraph Consumers
        PW2[Pest Warning]
        AD[Anomaly Detection]
        SC2[Supply Chain]
        KG[Knowledge Graph]
        ESG3[ESG]
        FIN[Financial]
        WM[Water Mgmt]
        WF2[Workforce]
        CCH[Compliance Chain]
        CMP2[Compliance]
        INS[Insurance]
        SO[Spray Optimizer]
        TR[Traceability]
        BM[Benchmarking]
        COM[Communication]
    end

    W -->|weather_alert| EB
    IOT2 -->|sensor_anomaly| EB
    H -->|harvest_completed| EB
    FLD -->|field_created| EB
    CMP -->|compliance_violation| EB
    MKT -->|marketplace_order| EB
    IOT2 -->|irrigation_trigger| EB
    EQ -->|equipment_maintenance| EB
    CB -->|carbon_entry_added| EB
    REG -->|regulatory_change| EB
    YP -->|yield_recalculated| EB
    PW -->|pest_risk_updated| EB
    SC -->|supply_chain_update| EB
    ESG2 -->|esg_recalculated| EB
    WF -->|workforce_scheduled| EB

    EB --> PW2
    EB --> AD
    EB --> SC2
    EB --> KG
    EB --> ESG3
    EB --> FIN
    EB --> WM
    EB --> WF2
    EB --> CCH
    EB --> CMP2
    EB --> INS
    EB --> SO
    EB --> TR
    EB --> BM
    EB --> COM
```

### Event Flow Chains

Some events cascade through the system:

```
weather_alert → pest_risk_updated → spray_optimizer
harvest_completed → supply_chain_update → traceability
compliance_violation → esg_recalculated → benchmarking + federation
carbon_entry_added → esg_recalculated → benchmarking + federation
marketplace_order → yield_recalculated → financial + insurance
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant MW as Edge Middleware
    participant TEL as Telemetry
    participant ERR as Error Handler
    participant VAL as Zod Validator
    participant RBAC as RBAC
    participant DL as Data Layer
    participant DB as SQLite

    C->>MW: HTTP Request
    MW->>MW: Check public path / token
    MW->>TEL: withTelemetry(handler)
    TEL->>ERR: withErrorHandling(handler)
    
    alt POST/PUT with body
        ERR->>VAL: validateBody(req, schema)
        alt Invalid
            VAL-->>C: 400 RFC7807 Problem
        end
    end

    ERR->>RBAC: requirePermission(user, perm)
    alt Unauthorized
        RBAC-->>C: 401 / 403
    end

    RBAC->>DL: Query data
    DL->>DB: Prisma query
    DB-->>DL: Results
    DL-->>C: 200 JSON Response

    TEL->>TEL: Record metrics (path, status, duration)
```

---

## Dual Data Architecture

The application uses two data strategies:

```mermaid
graph TD
    subgraph Persistent["Persistent Data (Prisma + SQLite)"]
        P1[Users & Auth]
        P2[Cooperatives & Farms]
        P3[Fields & Compliance]
        P4[IoT Readings]
        P5[Financial Entries]
        P6[Marketplace Orders]
    end

    subgraph Ephemeral["In-Memory Data (InMemoryStore)"]
        E1[RBAC Seed Data]
        E2[Demo Weather Data]
        E3[Route Optimization]
        E4[AI Advisories]
        E5[Yield Predictions Cache]
        E6[Event Bus State]
    end

    DL[data-layer.ts] --> Persistent
    IMS[InMemoryStore + *-data.ts] --> Ephemeral
    API[API Routes] --> DL
    API --> IMS
```

**Design rationale:** Core business entities use Prisma for durability. Feature-specific computed data, seed data for demos, and caches use `InMemoryStore<T>` for fast access and zero-migration iteration.

---

## Deployment Architecture

```mermaid
graph TD
    subgraph Docker["Docker Container"]
        subgraph Build["Multi-Stage Build"]
            B1[Stage 1: deps<br/>npm ci + prisma generate]
            B2[Stage 2: builder<br/>next build]
            B3[Stage 3: runner<br/>node server.js]
            B1 --> B2 --> B3
        end
        
        APP[Next.js Standalone]
        DB2[(SQLite Volume)]
        HC[Healthcheck<br/>GET /api/health]
    end

    APP --> DB2
    HC --> APP
```

- **Base image:** `node:20-alpine`
- **Port:** 3000
- **Healthcheck:** `GET /api/health` every 30s
- **Data persistence:** Docker volume `app-data`

---

## Module Map

The 45+ library modules in `src/lib/` are organized by concern:

| Category | Modules |
|----------|---------|
| **Auth & Access** | `auth-service.ts`, `auth.ts`, `rbac-middleware.ts`, `rbac-data.ts` |
| **Data Access** | `prisma.ts`, `data-layer.ts`, `db.ts`, `data.ts` |
| **API Infrastructure** | `api-errors.ts`, `telemetry.ts`, `event-bus.ts` |
| **Validation** | `validators/schemas.ts` |
| **Intelligence** | `ai-advisor.ts`, `intelligence-fabric.ts`, `moonshot-operating-system.ts` |
| **Predictions** | `yield-prediction.ts`, `weather-service.ts`, `route-optimizer.ts` |
| **Domain Data** | 25+ `*-data.ts` files (carbon, compliance, equipment, financial, etc.) |
| **Utilities** | `utils.ts`, `onboarding-service.ts` |
