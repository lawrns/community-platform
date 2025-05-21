Below is the filled‑out plan for Community.io, showing exactly what we’ll audit, how we’ll scope and sprint, and what we need to get rolling.

# 1. Discovery & Audit (1–2 days)

| Area                   | Goal                                                                                                                            |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Code & Infra Audit     | Identify any build failures in the Vite/pnpm pipeline (TS imports, missing env vars), test‑coverage gaps (<60 %), outdated dependencies (MUI v4→v5), DB‑connection hiccups, and CI/CD pipeline problems. |
| Error/Logs Review      | Pull Sentry, server console, browser console, and network logs to catalog uncaught exceptions (CORS, auth errors), slow endpoints (/api/feed, /api/thread/:id), and 500s. |
| UX & UI Audit          | Crawl all breakpoints (320–1920 px) to spot inconsistencies in spacing, button styles, form inputs, theme overrides, WCAG contrast failures, and missing accessibility attributes. |
| Performance & Security | Run Lighthouse and backend profiling to flag large JS bundles (>2 MB), slow SQL queries (EXPLAIN ANALYZE), missing CSP headers, overly permissive CORS, and auth rate‑limit gaps. |

## Deliverable: Ticket list split into three buckets, with rough estimates:

### Blockers (must fix before new work; ~1–3 days)

| Ticket    | Title                                                         | Estimate |
|-----------|---------------------------------------------------------------|----------|
| AUTH-001  | CI build failures: TS import errors in src/app                | 1 day    |
| DB-002    | Intermittent Postgres connection timeouts                     | 0.5 day  |
| PIPE-003  | Missing env vars (SENTRY_DSN, STRIPE_KEY) in staging          | 0.5 day  |

### High-Impact Upgrades (drive KPIs; ~3–5 days)

| Ticket    | Title                                                                      | Estimate |
|-----------|----------------------------------------------------------------------------|----------|
| SEC-101   | Enforce CSP & tighten CORS to allowed origins                              | 1 day    |
| PERF-102  | Code‑split homepage bundle & lazy‑load dashboard widgets                   | 2 days   |
| UI-103    | Standardize theme tokens in Styled‑Components (from Figma)                 | 1 day    |
| AUTH-104  | Add Passkey enrollment flow behind feature flag                            | 1 day    |

### Nice‑to‑Haves (phased in later; ~5–8 days)

| Ticket    | Title                                                   | Estimate |
|-----------|---------------------------------------------------------|----------|
| PWA-201   | Configure Workbox for offline reading cache             | 2 days   |
| MOBILE-202| Scaffold React Native/Expo app shell                    | 3 days   |
| API-203   | Initialize Plugin/API Marketplace module                | 3 days   |

# 2. Prioritized Roadmap & Implementation

| Sprint | Focus                                                                                                                     |
|--------|---------------------------------------------------------------------------------------------------------------------------|
| 1      | Blockers: CI build fixes, DB connectivity, missing env vars, Sentry integration                                            |
| 2      | Core Refactor: Theme tokens, code‑splitting, CSP/CORS lock‑down, scaffold Passkey support                                 |
| 3      | Design System: Publish @community/design‑tokens, migrate MUI overrides to Styled‑Components, update Storybook            |
| 4      | Feature Roll‑out: Passkey auth UI, Quadratic Voting wallet integration, AI Daily Brief widget on Dashboard               |
| 5      | Polish & QA: Performance tuning (Lighthouse P95 ≤ 1.2 s), accessibility audit (WCAG AA), e2e tests, documentation         |

# 3. To Get Started

| Item                               | Why                                                                                                      |
|------------------------------------|----------------------------------------------------------------------------------------------------------|
| Git repo & deployment creds        | To clone, build, run staging, and inspect live issues                                                    |
| CI logs & Sentry DSN               | To triage existing build/test failures and runtime exceptions                                            |
| Production DB read‑only creds + schema | To verify connectivity, inspect indexes, and optimize slow queries                                      |
| Current Figma/Sketch files or brand assets | To extract colors, typography, and component specs for the new design tokens                      |
| Links to 2–3 AI community sites you admire | To lock in a visual/UX reference direction before the redesign                                 |
| High‑level launch goals & timeline | E.g. target launch date, member‑count & ARR milestones, must‑have features at MVP launch                   |