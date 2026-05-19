---
id: rbac
title: Roles & Permissions (RBAC)
sidebar_position: 3
description: How AgriRomagna's role-based access control works, with a permission matrix and code examples.
---

# Roles & Permissions (RBAC)

AgriRomagna ships with a six-role RBAC system plus a `superadmin` super-role, mapped to 70+ resource × action permissions. The runtime check lives in `src/lib/rbac-middleware.ts`.

## The role model

```ts title="src/lib/rbac-data.ts"
export type RBACRole =
  | "superadmin"
  | "cooperative_admin"
  | "farm_manager"
  | "agronomist"
  | "seasonal_worker"
  | "buyer";
```

A seventh implicit role, `viewer`, exists in the seed data for read-only stakeholders.

| Role | Scope | Typical user |
|---|---|---|
| `superadmin` | All cooperatives | Platform operator |
| `cooperative_admin` | One cooperative | Cooperative president / IT lead |
| `farm_manager` | One farm | Farm owner |
| `agronomist` | One cooperative (read-write agronomic) | Co-op agronomist |
| `seasonal_worker` | Assigned fields | Field worker |
| `buyer` | Marketplace only | B2B buyer (GDO, restaurant) |
| `viewer` | Read-only within tenant | Auditor, observer |

## Permission shape

Each permission is `(resource, action, allowed_roles)`:

```ts
interface Permission {
  id: string;             // "fields.write"
  resource: string;       // "fields"
  action: "read" | "write" | "delete" | "admin";
  roles: RBACRole[];      // ["superadmin", "cooperative_admin", "farm_manager"]
}
```

The full table lives in [`src/lib/rbac-data.ts`](https://github.com/ForliLabs/agri-romagna/blob/main/src/lib/rbac-data.ts). The reference page lists the full matrix: see [Roles & Permissions reference](../reference/roles-and-permissions.md).

## Enforcing a permission in a route handler

```ts title="src/app/api/fields/route.ts"
import { requirePermission } from "@/lib/rbac-middleware";
import { requireAuth } from "@/lib/auth-service";
import { apiErrors } from "@/lib/api-errors";
import { data } from "@/lib/data-layer";

export async function POST(req: Request) {
  const ctx = await requireAuth(req);
  requirePermission(ctx, "fields", "write");

  const body = FieldCreateSchema.parse(await req.json());
  const field = await data.fields.create(ctx, body);

  return Response.json({ data: field }, { status: 201 });
}
```

`requirePermission` throws an `ApiError` with status `403` if the role isn't allowed. The error is rendered as an [RFC 7807 problem document](../reference/api-errors.md).

## Decision flow

```mermaid
flowchart TD
    A[Incoming request] --> B{Public path?}
    B -- yes --> Z[Pass through]
    B -- no --> C{Token present?<br/>(middleware)}
    C -- no, API --> R1[401]
    C -- no, page --> R2[Redirect /login]
    C -- yes --> D[Route handler: verify JWT]
    D --> E[requirePermission resource, action]
    E --> F{Role allowed?}
    F -- no --> R3[403]
    F -- yes --> G{Tenant match?}
    G -- no --> R4[403 Not your cooperative]
    G -- yes --> H[Execute + return data]
```

## Permission matrix highlights

| Resource | read | write | delete | admin |
|---|---|---|---|---|
| `fields` | all roles | superadmin, coop_admin, farm_manager, agronomist | superadmin, coop_admin | superadmin, coop_admin |
| `compliance` | superadmin, coop_admin, farm_manager, agronomist | superadmin, coop_admin, agronomist | superadmin, coop_admin | superadmin |
| `marketplace` | all roles including buyer | farm_manager, coop_admin | superadmin, coop_admin | superadmin |
| `governance` | all members | coop_admin (proposals) | superadmin | superadmin |
| `iot` | superadmin, coop_admin, farm_manager, agronomist | superadmin, coop_admin, farm_manager | superadmin | superadmin |
| `financial` | superadmin, coop_admin, farm_manager | superadmin, coop_admin, farm_manager | superadmin, coop_admin | superadmin |
| `roles` | superadmin, coop_admin | superadmin, coop_admin | superadmin | superadmin |

For the complete matrix, see [Roles & Permissions reference](../reference/roles-and-permissions.md).

## Testing RBAC

The RBAC layer has its own Vitest suite — `tests/lib/rbac-middleware.test.ts`. When adding a permission, add a test that:

1. The intended roles can perform the action.
2. The non-intended roles get a `403`.
3. A user from a different cooperative gets a `403`, even if their role allows the action.

```bash
npm run test -- rbac-middleware
```
