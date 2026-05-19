---
id: contributing
title: Contributing
sidebar_position: 1
description: How to contribute code, docs, translations and new modules to AgriRomagna.
---

# Contributing

Contributions are warmly welcome. AgriRomagna exists to serve real cooperatives, and that only works if it gets feedback and code from the people who use it.

## Quick links

- [GitHub repository](https://github.com/ForliLabs/agri-romagna)
- [Open issues](https://github.com/ForliLabs/agri-romagna/issues)
- [Discussions](https://github.com/ForliLabs/agri-romagna/discussions)
- [Code of conduct](./code-of-conduct.md)

## Where help is most needed

1. **Agronomic modules** — pest pressure models, regional crop varieties, soil-specific recommendations.
2. **Translations** — UI strings beyond Italian (English first, then French/Spanish for EU cooperative expansion).
3. **EU regulatory updates** — new CAP measures, evolving DPP draft schema, regional certification quirks.
4. **Real-world pilots** — if your cooperative wants to pilot, file an issue with `pilot-interest`.
5. **Documentation** — clarifications, missing examples, screenshots from real dashboards.

## Setting up your dev environment

```bash
git clone https://github.com/ForliLabs/agri-romagna.git
cd agri-romagna
npm install
cp .env.example .env

npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Tests should pass:

```bash
npm run test
```

## Branch and PR conventions

- Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Conventional Commits in commit messages (`feat:`, `fix:`, `docs:`, `chore:` …).
- One concern per PR. Smaller PRs land faster.
- Include tests for new business logic.
- Run `npm run lint && npm run test` before opening the PR.

## Pull request template

```markdown
## What

<short description>

## Why

<motivation, link to issue if any>

## How

<approach, trade-offs>

## Test plan

- [ ] Unit tests added/updated
- [ ] Manual: `npm run dev` and verify flow X
- [ ] No regressions in `npm run test`
```

## Adding a new domain module

Most useful contributions are new modules — apiary tracking, livestock, agritourism scheduling. The pattern is consistent:

1. **Schema**: add Prisma models with `cooperativeId` and (where appropriate) `farmId`.
2. **Data layer**: add a `data.<domain>` accessor in `src/lib/data-layer.ts`.
3. **Validators**: add Zod schemas in `src/lib/validators/`.
4. **Routes**: add `src/app/api/<domain>/route.ts` and id-scoped subroutes.
5. **RBAC**: add permissions to `src/lib/rbac-data.ts`.
6. **Tests**: unit tests in `tests/lib/` and route smoke tests.
7. **Docs**: a guide under `website/docs/guides/` and reference rows in `api.md` and `data-models.md`.
8. **Bus**: publish `<domain>.<verb>` events for cross-module reactions.

See [Concepts: Data layer](../concepts/data-layer.md) and [Concepts: Event bus](../concepts/event-bus.md).

## Reporting bugs

- Reproduction steps, expected and actual behavior.
- Environment: Node version, OS, Docker if applicable.
- The `X-Correlation-Id` from the response, if you have it.
- Server logs around the failure.

## Reporting security issues

**Do not** open a public issue. Use [GitHub Security Advisories](https://github.com/ForliLabs/agri-romagna/security/advisories) or email `security@agriromagna.example`. We respond within 72 hours.

## License of contributions

By contributing, you agree your work is licensed under the project's license (currently source-available; see [LICENSE](https://github.com/ForliLabs/agri-romagna/blob/main/LICENSE)). A formal CONTRIBUTING.md in the repo carries the legal version.

## Thank you

Cooperatives have always worked by combining many small contributions into something bigger than any member could build alone. The same is true of this codebase. Grazie.
