# Portfolio Security Audit

- Target: https://ilesanmi.vercel.app/ (Next.js 14.1.1 / React 18.2.0, Pages Router)
- Date: 2026-09-09
- Mode: source-code audit, **no files modified**
- Verdict convention used throughout:
  - **CONFIRMED VULNERABILITY** — code path verified in source
  - **POTENTIAL RISK** — plausible but needs runtime confirmation (test given)
  - **BEST-PRACTICE RECOMMENDATION** — hardening, no direct exploit shown

## Executive Summary

The application is a single-admin portfolio + blog with a real attack surface concentrated in three places: the **admin panel** (magic-link auth, post CRUD, S3 uploads), the **public blog rendering pipeline** (unsanitized stored HTML), and **missing platform controls** (no rate limiting outside the contact form, no security headers, an outdated Next.js). Authentication is a passwordless single-user allowlist that is enforced **only once at sign-in time** and never re-checked per request. The blog's `contentHtml` is stored and rendered with zero sanitization. The S3 presign endpoint accepts arbitrary content types. Draft posts leak through the public views API. No secrets were found committed, no `NEXT_PUBLIC_*` leakage exists, and per-resource ownership checks on posts are correctly implemented. The single highest-leverage actions are: upgrade Next.js (middleware auth-bypass CVE in the installed version), re-check `ADMIN_EMAIL` on every admin path, sanitize rendered HTML, lock down uploads, and add rate limiting + security headers.

## Attack Surface

Public, no auth: `/`, `/resume`, `/blog`, `/blog/[slug]`, `/blog/tag/[tag]`, `/admin/login`, `/auth/verify-request`, `POST /api/contact`, `GET/POST /api/views/[slug]`, `GET /api/og`, `POST /api/revalidate` (shared secret), `/api/auth/*` (NextAuth).
Authenticated (any valid session): `/admin`, `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]`, `GET/POST /api/admin/posts`, `GET/PATCH/DELETE /api/admin/posts/[id]`, `GET/POST/PATCH/DELETE /api/admin/tags`, `POST /api/admin/upload`.
External: PostgreSQL (RDS af-south-1), AWS S3 + CloudFront (`blog/coverImages/*`, `blog/postImages/*`), AWS SES (magic links), Gmail SMTP (contact mail), Vercel hosting/ISR.

## Architecture

Pages Router only (no `app/`). Auth: NextAuth v4 Email (magic-link) + PrismaAdapter, JWT sessions (30d), single-user allowlist `ADMIN_EMAIL` checked in `signIn` callback only. Page guard: `middleware.js` (`withAuth`, matcher `/admin/:path*`) + per-page `getServerSideProps` + per-API `getServerSession` — triple layer, but none re-checks the allowlist. DB: Postgres + Prisma 7 (`@prisma/adapter-pg`). Writes: Tiptap editor → `generateHTML` → `contentHtml` stored verbatim → `dangerouslySetInnerHTML` on public pages (ISR 60s). Uploads: browser → presigned S3 PUT (300s expiry) → CloudFront URL stored. Contact: `POST /api/contact` → Gmail SMTP to self. No CSP/HSTS/frame headers in `next.config.js`. `zod` installed but never used.

## Critical Vulnerabilities

None proven remotely exploitable without an admin session. The two items below are the closest and are rated High, not Critical, for that reason.

## High Vulnerabilities

### SEC-001 — Next.js 14.1.1 affected by middleware authorization-bypass CVE

- Severity: High | OWASP: A06 Vulnerable Components | CWE-287
- Affected file: `package.json` (`next: 14.1.1`), `middleware.js`
- Type: **CONFIRMED VULNERABILITY** (version in affected range)
- Root cause: installed Next.js predates the `x-middleware-subrequest` bypass fix (CVE-2025-29927, GHSA-f82v-jwr5-mffw; fixed in 14.2.25+). A forged header can skip `middleware.js`, the outer admin gate.
- Attack scenario: attacker sends admin-page requests with the bypass header, skipping the middleware redirect.
- Impact: moderated — every admin page **also** enforces `getServerSideProps` session checks and every admin API enforces `getServerSession`, so bypass alone yields no data without a valid session. Defense-in-depth failure, not a standalone break-in.
- Auth required? No for the bypass; yes for any payoff.
- Fix: upgrade to a patched Next.js (≥14.2.25) and re-test. Treat middleware as one layer only (it already is).
- Test: send `x-middleware-subrequest` variants at `/admin` on a preview deploy; expect redirect regardless.

### SEC-002 — Stored XSS via unsanitized `contentHtml`

- Severity: High | OWASP: A03 Injection (XSS) | CWE-79
- Affected file: `pages/api/admin/posts/[id].js:45` (stores), `pages/blog/[slug].jsx:79` (renders), `lib/tiptap-render.js` (no sanitizer)
- Type: **CONFIRMED VULNERABILITY** (full path verified; no `dompurify`/`sanitize-html` anywhere in repo)
- Root cause: `PATCH` accepts arbitrary `contentHtml`, stored verbatim; public page renders it via `dangerouslySetInnerHTML`. `Link` extension has no `protocols`/`isAllowedUri` guard, so `javascript:` URLs persist; `target=_blank` does not mitigate that.
- Attack scenario: compromised/stale admin session (or any future second author) saves `<a href="javascript:...">` / event-handler markup; every reader of `/blog/[slug]` executes it. Admin preview (`[id].jsx` preview dialog) renders the same unsanitized HTML (self-XSS today).
- Auth required? Yes (admin session to write); victims need none.
- Fix: sanitize server-side on write AND render (DOMPurify + jsdom or `sanitize-html`), allowlist `http/https/mailto` link protocols, strip event handlers/`style`/`javascript:`/`data:text/html`. Prefer rendering from `contentJson` instead of trusting stored HTML.
- Test: as admin, save `contentHtml` containing `<img src=x onerror=alert(1)>` and `<a href="javascript:alert(1)">`; confirm it is neutralized in the public page.

### SEC-003 — S3 presign accepts arbitrary content type/extension

- Severity: High | OWASP: A03 Injection / A01 Access Control | CWE-434
- Affected file: `pages/api/admin/upload.js:21-38`, `lib/s3.js:8-14,30-32`
- Type: **CONFIRMED VULNERABILITY**
- Root cause: `contentType` passes straight into `PutObjectCommand`; extension is `filename.split('.').pop()` with no allowlist and no MIME↔ext check; no size limit or `ContentLength` condition on the presigned PUT.
- Attack scenario: admin session (or XSS-obtained session) mints a PUT for `evil.html` / `image/svg+xml` with script content; serves attacker HTML/JS from your CloudFront domain (`https://<domain>/<key>`), ideal for phishing and cookie-adjacent attacks. Deterministic `blog/coverImages/<slug>.<ext>` keys also let any session overwrite another author's cover (BOLA on storage).
- Auth required? Yes (any valid session; no ownership check on `postSlug`).
- Fix: allowlist `image/jpeg,image/png,image/webp,image/gif` (+ext match), cap size (`ContentLengthRange`), randomize keys server-side (`crypto.randomUUID`), verify `postSlug` ownership, set `ContentDisposition: attachment` for non-images if ever allowed.
- Test: presign `text/html`, PUT HTML, fetch the CloudFront URL, confirm content type is image-only or blocked.

### SEC-004 — `ADMIN_EMAIL` allowlist checked only at sign-in, never per request

- Severity: High | OWASP: A01 Broken Access Control | CWE-285
- Affected files: `lib/auth.js:21` (only check) vs `middleware.js:9-16`, `pages/api/admin/posts/index.js:6-9`, `pages/api/admin/posts/[id].js:6-9`, `pages/api/admin/upload.js:12-15`, `pages/api/admin/tags.js:15-18`, all admin `getServerSideProps`
- Type: **CONFIRMED VULNERABILITY** (design flaw; safe today only while the sign-in gate holds)
- Root cause: after `signIn` succeeds, every layer accepts **any** valid session (`!!token` / `if (!session) 401`). Email rotation, a manually inserted `User` row, or session/adapter confusion silently promotes a non-admin to full admin (posts, tags, uploads).
- Attack scenario: attacker obtains any valid session (e.g., tricks owner into creating a user row, stale JWT after `ADMIN_EMAIL` change) → full admin with no further check.
- Fix: `isAdmin(session) => session?.user?.email === process.env.ADMIN_EMAIL` enforced in middleware `authorized`, every admin API handler, and every admin `getServerSideProps`.
- Test: with a non-allowlisted valid session (staging), request each admin API/page; expect 401/403/redirect everywhere.

## Medium Vulnerabilities

### SEC-005 — Draft/unpublished posts disclosed + slug enumeration via views API

- Severity: Medium | OWASP: A01 | CWE-200
- Affected file: `pages/api/views/[slug].js:7-21` (`GET` and `POST` lookups have no `status:PUBLISHED` filter; `404` vs `200` oracle)
- Type: **CONFIRMED VULNERABILITY**
- Attack scenario: enumerate `/api/views/<guess>`; `200 {views}` confirms a slug exists (including DRAFT/ARCHIVED) and leaks its count; `404` confirms absence. Scheduled/embargoed content existence leaks pre-publish.
- Fix: filter both lookups to `status:PUBLISHED, publishedAt <= now`; return uniform responses that don't distinguish missing vs hidden.
- Test: create DRAFT post, `GET /api/views/<draft-slug>` as anonymous; expect 404.

### SEC-006 — No rate limiting on auth, views, or admin APIs

- Severity: Medium | OWASP: A07 / A09 | CWE-770
- Affected files: `pages/api/auth/*`, `pages/api/views/[slug].js`, all `pages/api/admin/*` (only `pages/api/contact.js:3-23` has any limiter)
- Type: **CONFIRMED VULNERABILITY** (absence verified)
- Attack scenario: magic-link email bombing (SES cost + phishing noise), view-count inflation (no CAPTCHA; XFF-rotatable IP), presigned-URL/tag/post brute force, login callbackUrl probing.
- Fix: per-IP + per-account throttling (Upstash/Vercel KV or middleware), CAPTCHA on login/contact, alerting on SES volume.
- Test: 50 rapid magic-link requests for one email; expect throttling, currently none.

### SEC-007 — Contact limiter bypassable; reporter-controlled mail content

- Severity: Medium | OWASP: A07 / A03 | CWE-770, CWE-113
- Affected file: `pages/api/contact.js:7-23,41-44,63,168`
- Type: **CONFIRMED VULNERABILITY** (limiter limits) / mitigated content handling (verified `escapeHtml` at lines 102-162)
- Root cause: IP from spoofable `X-Forwarded-For`; in-memory `Map` per serverless instance (lost on cold start, unbounded growth); no CAPTCHA/honeypot. Subject `New portfolio message from ${name}` and `replyTo` carry raw input (nodemailer handles header encoding — no header injection found — but inbox content is attacker-shaped).
- Attack scenario: rotate XFF across instances → unlimited Gmail sends → spam, quota/cost abuse, owner-inbox flooding.
- Fix: durable store-backed limiter keyed on IP+payload hash, CAPTCHA, strip newlines from name/subject, max lengths already present (keep).
- Test: 6+ submissions with rotated XFF; expect 429, currently 200.

### SEC-008 — Over-broad mass assignment on post PATCH (slug/status/publishedAt/coverImage)

- Severity: Medium | OWASP: A01 / A08 | CWE-915
- Affected file: `pages/api/admin/posts/[id].js:31-52`
- Type: **CONFIRMED VULNERABILITY**
- Root cause: allowlisted but sensitive fields are client-controllable with no validation: raw `slug` (collision/hijack → unique-violation 500s), unvalidated `status`, arbitrary `publishedAt` (backdate/schedule games), arbitrary `coverImage` string (no URL/host allowlist).
- Attack scenario: session holder renames slugs to squat published URLs, backdates posts, points covers at third-party hosts (tracking/malware-adjacent).
- Fix: validate slug format + uniqueness (exclude self), enum-check `status`, constrain `publishedAt` (no far past; future only via schedule UI), allowlist cover host to your CloudFront domain.
- Test: PATCH another post's slug; expect 409, currently 500-or-overwrite behavior.

### SEC-009 — `/api/revalidate` broken and unsafe by design

- Severity: Medium (functionally dead today) | OWASP: A01/A08 | CWE-639
- Affected file: `pages/api/revalidate.js:1,8-20`
- Type: **CONFIRMED VULNERABILITY** (code-verified; `next/cache:revalidatePath` does not work in Pages API routes — should be `res.revalidate`)
- Root cause + risk: unvalidated `path` (any route, no allowlist) + body-carried secret (logged/retained) + string `!==` compare. If "fixed" naively it becomes an arbitrary cache-poisoning primitive.
- Fix: switch to `res.revalidate`, allowlist `^/blog(/|$)|^/$`, `timingSafeEqual` on hashed secret, add rate limit + audit log, document `REVALIDATE_SECRET` (missing from `.env.example`).
- Test: `POST {path:'/admin', secret:'x'}`; expect 401 without valid secret (works) and 400 for non-allowlisted path after fix.

### SEC-010 — No security headers (CSP, HSTS, framing, MIME)

- Severity: Medium | OWASP: A05 | CWE-693
- Affected file: `next.config.js` (no `headers()`), `vercel.json` (no headers)
- Type: **CONFIRMED VULNERABILITY** (absence verified)
- Impact: no clickjacking barrier for the admin UI (login CSRF-adjacent flows, editor), no MIME-sniffing guard, no XSS blast-radius limiter. Partial mitigations exist: NextAuth cookies default `httpOnly, SameSite=Lax, Secure` in prod; state-changing APIs are non-GET so Lax blocks most cross-site CSRF.
- Fix (relevant, not maximalist): `Content-Security-Policy` (self + SES/S3/CloudFront/Vercel insights hosts; no `unsafe-inline` except where Next requires), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation=()), `X-Frame-Options: DENY` (admin has no embed need).
- Test: `curl -I https://ilesanmi.vercel.app/`; confirm headers present post-fix.

## Low Vulnerabilities

### SEC-011 — 404 vs 403 oracle on post IDs

- `pages/api/admin/posts/[id].js:18-24`. Authenticated attacker distinguishes nonexistent vs another author's post. Low (cuid IDs unguessable). Fix: uniform 404.

### SEC-012 — `ADMIN_EMAIL` exposed in login page JSON

- `pages/admin/login.jsx:5,101`. Value unused by the component but shipped in props. Low (address is semi-public). Fix: stop passing it.

### SEC-013 — Magic-link URL in query + `_blank` opener page

- `pages/auth/verify-request.jsx:62-72,84-95`. Token-bearing URL in history/server logs; `rel="noopener noreferrer"` already present (good). Low. Fix: single-use short-lived tokens (already), avoid rendering the raw URL, add `Referrer-Policy`.

### SEC-014 — 30-day JWT, no rotation/revocation/idle timeout

- `lib/auth.js:38-41`. Stolen cookie = month-long admin. Low-Medium. Fix: shorten to 7d, add idle-time re-check, document revocation (rotate `NEXTAUTH_SECRET`, delete `Session` rows).

## Informational Findings

- **INF-01 (positive): secrets hygiene good.** `.env.local` gitignored and uncommitted; zero `NEXT_PUBLIC_*` vars; no keys/tokens in source (grep verified).
- **INF-02: CSRF posture acceptable-by-default.** Mutations are POST/PATCH/DELETE + `SameSite=Lax` cookies; no classic CSRF hole found. Add CSRF defense-in-depth only if cookies ever become `SameSite=None`.
- **INF-03: No SSRF found.** No route fetches user-supplied URLs; `coverImage` is stored, never fetched server-side.
- **INF-04: Contact XSS handled.** `escapeHtml` on all interpolated mail fields; messages never rendered in any UI.
- **INF-05: ViewEvent retains raw IPs indefinitely.** Privacy/GDPR: hash or truncate IPs, add retention purge.
- **INF-06: `og.jsx` uses App-Router export idiom under `pages/api`.** Functions in production; input slicing (90/160/3) adequate; no fetch/redirect sinks. Leave, but add a comment + rate limit.
- **INF-07: Login `from` → `callbackUrl`.** Relies on NextAuth same-origin check; ensure `NEXTAUTH_URL` is exact production URL; never pass absolute external `from` through.
- **INF-08: Preview deployments share production env.** If Vercel previews run against prod DB/SES, every preview exposes the admin to the internet with prod secrets. Use preview password protection + staging DB/SES sandbox.
- **INF-09: `zod` installed, never used.** All API validation is hand-rolled. Adopt it per endpoint (schema + test).

## Endpoint Security Matrix

| Method | Endpoint | Auth | AuthZ | Input validation | Rate limit | Risk |
|---|---|---|---|---|---|---|
| GET/POST | `/api/auth/*` | — (entry) | allowlist@sign-in only | NextAuth defaults | none | Medium (bombing, SEC-006) |
| POST | `/api/contact` | none (public) | n/a | manual lengths+regex | in-memory 5/min, bypassable | Medium (SEC-007) |
| GET | `/api/views/[slug]` | none | none; leaks drafts | none (slug raw) | dedupe only, spoofable | Medium (SEC-005) |
| POST | `/api/views/[slug]` | best-effort session (fail-open) | admin-skip only | none | dedupe only | Medium (SEC-005/006) |
| GET | `/api/og` | none | n/a | slicing only | none | Low |
| POST | `/api/revalidate` | shared secret (body) | none | path unvalidated; broken impl | none | Medium (SEC-009) |
| GET | `/api/admin/posts` | session | scoped authorId ✓ | n/a (list, no paging) | none | Low |
| POST | `/api/admin/posts` | session | owned create ✓ | title-only | none | Medium (SEC-006/008) |
| GET/PATCH/DELETE | `/api/admin/posts/[id]` | session | authorId check ✓ | weak (SEC-002/008) | none | High (SEC-002) |
| GET/POST/PATCH/DELETE | `/api/admin/tags` | session | none (global tags) | slugify+lengths | none | Low |
| POST | `/api/admin/upload` | session | none (any slug) | kind-only | none | High (SEC-003) |

## Top 10 Issues To Fix First

1. Upgrade Next.js off 14.1.1 (SEC-001).
2. Sanitize `contentHtml` on write + render; pin link protocols (SEC-002).
3. Upload allowlist: image MIME/ext/size, random keys, ownership check (SEC-003).
4. Enforce `isAdmin(session)` in middleware, all admin APIs, all admin GSSPs (SEC-004).
5. Hide drafts from `/api/views` + uniform 404 (SEC-005).
6. Rate-limit auth/views/admin/contact durably; CAPTCHA on login+contact (SEC-006/007).
7. Validate PATCH fields: slug uniqueness/format, status enum, publishedAt bounds, cover host (SEC-008).
8. Fix or remove `/api/revalidate`; allowlist paths, constant-time secret (SEC-009).
9. Ship security headers (CSP, HSTS, nosniff, framing, referrer, permissions) (SEC-010).
10. Shorten session lifetime + revocation runbook; stop leaking `adminEmail`; uniform 404 vs 403 (SEC-011/012/014).

## Authentication Assessment

Magic-link-only (no passwords to hash/leak — good), JWT 30d (too long), no brute-force/rate-limiting on login, no revocation story, `NO_SECRET`-class misconfig already caused a production outage (fail-open views path added as resilience). Allowlist architecture is single-point: one email check at sign-in. No account enumeration via password reset (none exists); magic-link request may itself be an oracle — verify whether non-allowlisted addresses trigger SES sends (test below; do not assume).

## Authorization Assessment

Post ownership (`authorId === session.user.id`) correctly enforced on read/write/delete paths. Everything else is authentication-only: tags (global by schema), uploads (any slug), revalidate (secret only), views (public by design). No role model beyond the unenforced allowlist. Frontend role checks: none found (no `role ===` gates) — all enforcement is server-side, which is correct.

## Blog Security Assessment

Creation/editing correctly require a session and (for `[id]`) ownership; unpublished posts are correctly hidden from public pages/SSR (`PUBLISHED + lte(now)` + `notFound`). Gaps: no per-request admin re-check, weak PATCH validation, stored-XSS sink, draft disclosure via views API, slug enumeration, no rate limits, ISR cache means takedowns take ≤60s to propagate.

## Admin Security Assessment

Routes undiscoverable from UI but trivially guessable (`/admin/*`); obscurity correctly not relied upon — middleware + GSSP + API checks exist on every path (verified). Weaknesses: allowlist not re-checked (SEC-004), sessions long-lived (SEC-014), uploads/tags over-permissive (SEC-003, tags), no audit logging of admin actions, no brute-force protection on login, autosave PATCH every 1.5s amplifies any session-hijack impact.

## Contact Form Assessment

Best-validated endpoint in the app (lengths, email regex, escaping, only rate-limited route). Residual: limiter bypass via XFF rotation and serverless per-instance memory (spam/cost abuse at low rate), no CAPTCHA, attacker-shaped inbox content (mitigated by escaping), Gmail app-password in env (verify it's a scoped app password, not the account password).

## Frontend Security Assessment

16 `dangerouslySetInnerHTML` uses: 1 attacker-reachable (blog `contentHtml`, unsanitized — SEC-002), 1 self-XSS (admin preview), 14 static (theme script, SVG icons, signature, JSON-LD with static data — safe today; `Seo.jsx` JSON-LD would become a sink if dynamic data is ever passed). No `eval`/`innerHTML`/iframes/`javascript:` literals in source. No third-party scripts observed beyond Next/Vercel defaults. Resume PDF static.

## API Security Assessment

No SQL/NoSQL/command injection (all Prisma parameterized; no raw queries; no shell). No SSRF/path traversal (no server-side fetching of user input; S3 keys are flat-namespace). No `...req.body` mass-spread anywhere (explicit destructuring — good). Findings concentrate on authz depth, validation thinness, rate limits, and the upload/revalidate/views issues above.

## Database Assessment

Postgres + Prisma, parameterized throughout; user input reaches only `where` values and `data` fields (no raw SQL). Ownership enforced per-query on posts. Gaps: over-broad update allowlist, slug TOCTOU races, unbounded `findMany` (no pagination on admin list/tags), destructive deletes with no soft-delete/confirm-server-side, indefinite IP retention in `ViewEvent`.

## Dependency Assessment

`npm audit` (prod): 10 vulns (9 high, 1 critical). Notable: **Next.js range advisory bundle including middleware auth bypass + cache-poisoning/DoS families — upgrade promptly**; `nodemailer` recipient-domain validation bypass (GHSA-cc9r, no fix available — relevant to `replyTo` handling; exposure limited by fixed `to`); `postcss` advisories are build-time; `nanoid` fixable via `npm audit fix`; `deepmerge-ts`/`mysql2` require Prisma major bump (plan, don't rush). Tiptap 3.31.3, React 18.2.0, Prisma 7.10.0 show no flagged direct advisories in this run. Do not upgrade blindly — stage, run build + auth/upload/blog smoke tests.

## Deployment Assessment

Vercel + Node 22. `vercel.json` is bare (no headers/redirects). Required prod vars: `DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_EMAIL, AWS_* (REGION/S3_BUCKET/CLOUDFRONT_DOMAIN/keys/SES_*), CONTACT_GMAIL_*`; `REVALIDATE_SECRET` undocumented. Past outage cause identified: missing `NEXTAUTH_SECRET` in prod → `getServerSession` throws (views route now fail-opens; admin routes correctly fail-closed). Confirm preview deployments don't share prod DB/SES, enable Vercel preview protection, attach DB allowlisting for serverless egress, set up log alerts on 401/429/500 spikes.

## Security Testing Gaps

Unverified at runtime (recommended tests): non-allowlisted magic-link request — does SES send? (`POTENTIAL RISK`); `javascript:` link persistence end-to-end; SVG-as-cover script execution via CloudFront; XFF-rotated view inflation rate; `x-middleware-subrequest` behavior pre/post upgrade; header presence in prod; preview-deploy isolation. Suggested minimum: authenticated Postman/Thunder collection covering the endpoint matrix (401/403/404 cases), a stored-XSS payload suite for `contentHtml`, upload of `evil.svg`/`.html`, and a 50-req rate-limit probe per endpoint.
