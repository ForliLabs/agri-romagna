---
id: roles-and-permissions
title: Roles & Permissions Matrix
sidebar_position: 6
description: Full RBAC matrix — every role × resource × action combination.
---

# Roles & Permissions Matrix

This page is the **authoritative reference** for what each role can do. The source of truth is [`src/lib/rbac-data.ts`](https://github.com/ForliLabs/agri-romagna/blob/main/src/lib/rbac-data.ts).

## Roles

| Role | Scope | Use case |
|---|---|---|
| `superadmin` | Platform-wide | Platform operator |
| `cooperative_admin` | One cooperative | Co-op president / IT lead |
| `farm_manager` | One farm | Farm owner |
| `agronomist` | One cooperative (agronomic R/W) | Co-op agronomist |
| `seasonal_worker` | Assigned fields | Field worker |
| `viewer` | Read-only within tenant | Auditor / observer |
| `buyer` | Marketplace only | B2B buyer |

## Actions

- `read` — list and view
- `write` — create and update
- `delete` — remove (soft delete unless noted)
- `admin` — configure, audit-log access, lock periods

## Matrix

Legend: ✅ = allowed, ➖ = not allowed.

| Resource | Action | super | coop_admin | farm_mgr | agronomist | seasonal | viewer | buyer |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **fields** | read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ |
| | write | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ |
| | delete | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **field journal** | read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ |
| | write | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ |
| **harvests** | read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ |
| | write | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ |
| **compliance** | read | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ➖ |
| | write | ✅ | ✅ | ➖ | ✅ | ➖ | ➖ | ➖ |
| | delete | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| | admin | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **compliance chain** | read | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ➖ |
| **traceability** | read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | write | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ |
| **iot** | read | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ➖ |
| | write | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ |
| | delete | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **financial** | read | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ |
| | write | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ |
| **carbon** | read | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ✅ |
| | write | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ |
| **marketplace products** | read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | write | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ |
| **marketplace orders** | read (own) | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ✅ |
| | write | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ✅ |
| **governance** | read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ |
| | write | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **votes** | cast | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ |
| **roles** | read | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| | admin | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **users** | invite | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| | suspend | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **federation** | read | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| | write | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| **analytics** | read | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ➖ |
| **audit log** | read | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |

## Tenant-boundary enforcement

Even when an action is allowed by role, AgriRomagna **also** verifies the target resource belongs to the user's cooperative (and farm, for farm-scoped resources). A `cooperative_admin` of Co-op A cannot edit a field of Co-op B regardless of role permissions.

See [Concepts: Multi-tenancy](../concepts/multi-tenancy.md) and the implementation in `src/lib/data-layer.ts`.
