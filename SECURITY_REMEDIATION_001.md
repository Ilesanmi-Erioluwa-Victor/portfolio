# Security Remediation 001 — SEC-001 (Next.js upgrade)

- Date: 2026-09-09
- Scope: SEC-001 ONLY. No application code touched. No router migration. No other findings fixed.

## Versions

- Old: `next 14.1.1` (pinned), React 18.2.0
- New: `next 14.2.35` (pinned), React 18.2.0 (unchanged)
- Architecture preserved: Pages Router, `middleware.js` unchanged, all `getServerSideProps`/`getServerSession` checks intact.

## Packages changed

- `package.json`: `next: 14.1.1` → `14.2.35` (1 line)
- `package-lock.json`: `next`, `@next/env`, `@next/swc-*` → 14.2.35/14.2.33 (61 insertions, 50 deletions total)
- Nothing else installed, removed, or upgraded. React, next-auth (4.24.x), Prisma 7, Tiptap 3.31, AWS SDKs untouched.
- Compatibility: Next 14.2.x officially supports React 18.2, Pages Router, next-auth v4, and Vercel Node 22 — all satisfied, confirmed by green build.

## Vulnerabilities resolved

- **Middleware authorization bypass (CVE-2025-29927 / GHSA-f82v-jwr5-mffw)**: `npm audit` no longer flags it for the installed version. This was the SEC-001 finding.
- Incidental: other 14.1.x-only advisories in the bundle drop out with the minor bump.

## Vulnerabilities remaining (from `npm audit --omit=dev`, 10 total: 9 high, 1 critical)

- `next` (critical tag persists): remaining advisories are App Router / Server Actions / image-optimizer / i18n / self-hosted families (e.g. GHSA-3g8h-86w9-wvmq cache-poisoned redirects, GHSA-36qx-fr4f-26g5 Pages+i18n bypass). **Not applicable**: this app uses Pages Router, no Server Actions, no i18n, no `remotePatterns`, hosted on Vercel. Fixing these requires a Next 15 major migration — out of scope for SEC-001.
- `nanoid ≤3.3.17` (high, transitive): fixable with plain `npm audit fix` (no breaking change) — left for a later pass.
- `nodemailer` (high bundle incl. GHSA-cc9r recipient bypass): no fix available upstream; exposure limited (fixed `to`, see audit).
- `postcss` (high, build-time only): fix requires Next 15 (`npm audit fix --force` would jump majors) — deferred.
- `deepmerge-ts` / `mysql2` (high, via Prisma tooling): fix requires Prisma 6 major — deferred.

## Build result

- `npm run build`: **EXIT 0** — `✓ Compiled successfully`, 13 static pages generated, `next-sitemap` completed.
- `npm run lint` (`next lint`): pass, 1 pre-existing warning (`pages/blog/[slug].jsx:26` exhaustive-deps, untouched by this change).

## Authentication test results (local `next start` prod build)

| Test | Result |
|---|---|
| Homepage `/` | 200 |
| Blog `/blog` | 200 |
| Admin login `/admin/login` | 200 |
| Unauthenticated `/admin` | 307 → `/admin/login` |
| Unauthenticated `/api/admin/posts` | 401 |
| Authenticated admin flows (login → session → editor/S3) | not runnable here (needs SES inbox + RDS session); code paths untouched — verify manually in staging |

## Middleware test results (bypass headers, local prod build)

| Test | Result |
|---|---|
| `GET /admin` (no header) | 307 → login ✅ |
| `GET /admin` + `x-middleware-subrequest: middleware` | 307 → login ✅ |
| `GET /admin` + `x-middleware-subrequest: <id>` variant | 307 → login ✅ |
| `GET /api/admin/posts` (no header) | 401 ✅ |
| `GET /api/admin/posts` + bypass header | 401 ✅ |

No header variant bypassed middleware. Defense-in-depth retained: `middleware.js`, `getServerSideProps` guards, and per-API `getServerSession` checks are all byte-identical to before.

## Compatibility concerns

- None observed. `eslint-config-next 13.4.3` still lints cleanly under Next 14.2. SWC binaries resolved for the platform. ISR/sitemap output identical shape (13 pages).
- Vercel: no config change needed; `vercel.json` Node 22.x satisfies 14.2.x.

## Commands executed

1. `npm install next@14.2.35` (populated 14.2.35; manifest write interrupted by timeout)
2. Pinned `package.json` → `14.2.35`, `npm install --package-lock-only --prefer-offline` (lockfile synced)
3. `npm audit --omit=dev` (+ `--json` breakdown)
4. `npm run build` (EXIT 0), `npm run lint` (pass + 1 pre-existing warning)
5. `npx next start -p 3100` + curl matrix above (7 checks, all pass)

## Files changed

- `package.json` (1 line)
- `package-lock.json` (Next.js subtree only)

Note: `components/Hero.jsx` shows a 1-line uncommitted diff predating this work — not mine, left untouched.
`SECURITY_AUDIT.md` remains untracked as before.

## Remaining security issues

Everything else in `SECURITY_AUDIT.md` is untouched: SEC-002…SEC-014, INF items, and the dependency backlog above.

## Safe to proceed to SEC-002?

**Yes.** The platform is now on a supported patched Next.js line, build/lint/middleware verified, change surface is two manifest files. SEC-002 (stored-XSS sanitization) is independent of this change and clear to start.
