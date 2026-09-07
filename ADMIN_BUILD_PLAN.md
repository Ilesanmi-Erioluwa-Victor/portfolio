# Admin Dashboard — Build Plan

Single-author CMS for the portfolio blog, replacing the hardcoded
`data/posts.js` with a real database, an authenticated admin UI, and image
storage on AWS S3 + CloudFront.

AWS region: **af-south-1** (Cape Town). Vercel function region set to
match in `vercel.json` so DB calls stay in-region.

---

## Phase 1 — Data layer

The DB is the foundation. Nothing else works without it.

**1.1 — Add dependencies.** Install Prisma (`@prisma/client` + `prisma`),
AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/client-ses`,
`@aws-sdk/s3-request-presigner`), NextAuth (`next-auth`,
`@next-auth/prisma-adapter`), Tiptap (`@tiptap/react`, `@tiptap/starter-kit`,
`@tiptap/extension-image`, `@tiptap/extension-link`,
`@tiptap/extension-code-block-lowlight`, `lowlight`), `@tiptap/html`
for server-side render, Zod for input validation, and React Hook Form
for the editor sidebar.

**1.2 — Define schema.** `prisma/schema.prisma` with the models:

- `User` — id, email (unique), name, createdAt. One row per
  allowed sign-in.
- `Account`, `Session`, `VerificationToken` — NextAuth's required
  tables for the magic-link flow.
- `Post` — id, slug (unique), title, excerpt, contentJson (Tiptap JSON
  document), contentHtml (pre-rendered HTML cached on save),
  coverImage (S3 key, optional), status enum
  (`DRAFT`/`PUBLISHED`/`ARCHIVED`), publishedAt, createdAt,
  updatedAt, authorId, tags relation, `views Int @default(0)` (atomic
  counter for public page views, displayed on the post page),
  `viewEvents ViewEvent[]` relation.
- `ViewEvent` — id, postId, post relation, ip (nullable for
  privacy-respecting browsers), userAgent (nullable), createdAt.
  Indexed on `(postId, createdAt)` for per-day analytics later.
  One row per counted view; the `Post.views` counter is the
  displayed value, the table is the audit log.
- `Tag` — id, slug, name (unique), posts relation.
- Indexes: `@@index([status, publishedAt])` on Post, `@@index([slug])`
  on Post. Compound index makes the "all published posts in date order"
  query fast; slug index makes `findUnique({ where: { slug } })`
  O(log n) instead of O(n).

**Why the hybrid (counter column + event table):** a `Post.views`
integer, updated via Prisma's atomic `increment: 1` operation, is
read-free on every page load (no `COUNT(*)` per request). The
`ViewEvent` table gives you a per-day breakdown and referrer
analysis later without a schema migration. The counter is for
display, the table is for analytics.

**Why atomic increment and not read-then-write:** two visitors
landing at the same time both read `views = 47` and both write
`views = 48`, losing one count. Prisma's `increment: 1` translates
to a single SQL `UPDATE Post SET views = views + 1 WHERE id = ?`
which Postgres serializes at the row level. No lost counts.

**1.3 — Generate and apply the first migration.** `npx prisma migrate
dev --name init`. This creates `prisma/migrations/<timestamp>_init/migra
tion.sql` with the table definitions. Apply to local Docker Postgres
first; commit the SQL file.

**1.4 — DB client singleton.** `lib/db.js` — one `PrismaClient` per
Node process, stored on `globalThis` in dev to survive HMR.

**1.5 — Seed script.** `prisma/seed.js` upserts the admin user (email
from `ADMIN_EMAIL` env var) so we have a valid User row before the
first sign-in. Wire up `prisma.seed` in `package.json`.

**Done when:** `npx prisma migrate dev` succeeds against local Postgres,
seed creates a User row, `npx prisma studio` shows the empty Post and
Tag tables.

---

## Phase 2 — Auth

**2.1 — Auth config.** `lib/auth.js` exports `authOptions` for
NextAuth: PrismaAdapter, EmailProvider, custom `signIn` callback that
returns `true` only if `user.email === process.env.ADMIN_EMAIL`.
Single-user allowlist; no roles.

**2.2 — SES email sender.** `lib/ses.js` — `sendVerificationRequest`
function called by NextAuth when a magic-link email is needed. Uses
`@aws-sdk/client-ses` `SendEmail` command (not the templated API for
now — simpler, no template required). The email is plain HTML with a
single "Sign in" button linking to the magic URL.

**2.3 — NextAuth catch-all route.** `pages/api/auth/[...nextauth].js` —
three lines, re-exports `NextAuth(authOptions)`.

**2.4 — Login page.** `pages/admin/login.jsx` — a minimal centered
form with an email field and a "Send magic link" button. Shows a
"Sent — check your email" state after submit. Pre-built CSS class
hooks from existing styles.

**2.5 — Middleware.** `middleware.js` at repo root, matches
`/admin/:path*`. Re-exports `next-auth/middleware` default. Unauth
visitors redirect to `/admin/login?from=<path>`.

**2.6 — Vercel env vars for auth.** Add `NEXTAUTH_SECRET` (32+ char
random), `NEXTAUTH_URL`, `AWS_SES_REGION`, `AWS_SES_FROM` (verified
SES identity), `ADMIN_EMAIL`.

**Done when:** visiting `/admin/login` shows the form, submitting
sends an SES email, clicking the link signs you in, the session
cookie persists, `/admin/posts` shows a placeholder page that reads
the session and displays the user's email.

---

## Phase 3 — S3 image uploads

The browser uploads directly to S3 via pre-signed URLs. Vercel
never sees the file bytes.

**3.1 — Pre-signed URL helper.** `lib/s3.js` — `presignUpload(key,
contentType)` returns a pre-signed `PUT` URL valid for 5 minutes.
Uses `@aws-sdk/s3-request-presigner` `getSignedUrl`.

**3.2 — Upload API route.** `pages/api/admin/upload.js` —
`POST { kind: 'cover' | 'inline', filename, contentType, postSlug? }`.
Generates the S3 key (`blog/coverImages/<slug>.<ext>` for cover,
`blog/postImages/<random>.<ext>` for inline), calls `presignUpload`,
returns `{ uploadUrl, publicUrl }`. The publicUrl is
`https://<AWS_CLOUDFRONT_DOMAIN>/<key>`.

**3.3 — Tiptap image extension hookup.** Wire the Tiptap
`Image.configure({...})` extension so its `addImage` command calls
`/api/admin/upload`, awaits the response, and inserts
`<img src={publicUrl}>`. The pre-signed upload happens in the
browser, so Vercel is bypassed entirely.

**Done when:** `curl -X POST` to the upload endpoint returns a
working pre-signed URL, the same URL can be used to PUT a file to
S3, and the file is then publicly accessible at the CloudFront URL.

---

## Phase 4 — Tiptap admin editor

The core writing experience.

**4.1 — Post list page.** `pages/admin/index.jsx` — server-rendered
list of all posts grouped by status (Drafts / Published). Each row:
title, last updated, status badge, edit button, "View on site" link
for published posts. "+ New post" button at top right.

**4.2 — New post page.** `pages/admin/posts/new.jsx` — on first
save, creates a Post row with a generated slug, redirects to
`/admin/posts/[id]`.

**4.3 — Edit post page.** `pages/admin/posts/[id].jsx` — Tiptap
editor with title, slug, excerpt, tags, cover image, and rich-text
body. Sidebar holds metadata. Toolbar at top. Autosave on a 1.5s
debounce after the user stops typing. Publish/Unpublish button.

**4.4 — Post CRUD API routes.** `pages/api/admin/posts/index.js`
(GET list, POST create) and `pages/api/admin/posts/[id].js` (GET,
PATCH, DELETE). Every handler calls `getServerSession` to verify
the request is from a signed-in user before any DB access.

**4.5 — Tiptap → HTML renderer.** `lib/tiptap-render.js` — uses
`@tiptap/html`'s `generateHTML(doc, extensions)` with the same
extension set the editor uses. Called on save, result cached in
`Post.contentHtml`. The public page renders this HTML directly.

**4.6 — On publish, revalidate.** When a post transitions to
`PUBLISHED`, the API calls `revalidatePath('/blog')` and
`revalidatePath('/blog/[slug]', 'page')`. The next visitor
triggers a fresh static generation. No deploy needed for a new
post to appear.

**4.7 — View counter (read path).** `lib/views.js` exports
`recordView({ postId, ip, userAgent })` and the dedupe helper
`recentlyViewed(ip, slug)`. The flow on a public post page load:

1. Server (or client) checks the request — skip if `userAgent`
   matches a bot regex (`Googlebot`, `bingbot`, `AhrefsBot`,
   `YandexBot`, `DuckDuckBot`, plus any `bot`/`crawler`/`spider`
   substring, case-insensitive). Bots never increment.
2. Server reads the session cookie via `getServerSession`. If a
   user is signed in, skip — your own preview loads don't count.
3. In-memory `Map<ip+slug, lastSeenAt>` — if the same IP viewed
   the same post within the last hour, skip. Survives only as
   long as the warm serverless instance; that's fine for the
   "did this human refresh 5 times" case.
4. Otherwise: `prisma.post.update({ where: { id }, data: { views:
   { increment: 1 } } })` — atomic SQL increment, no race
   condition. Then `prisma.viewEvent.create({ data: { postId,
   ip, userAgent } })` to keep the audit log.

The increment is called from a small client-side `useEffect` on
mount of the public post page component, calling a thin
`POST /api/views/[slug]` route. This keeps the increment off
the static-render path (no ISR regeneration triggered per view)
and lets the browser send the IP via the request headers
without blocking the HTML response.

**Done when:** every fresh visitor from a new IP increments the
counter; refreshing the same URL within an hour does not;
signed-in admin sessions do not increment; known bot user
agents do not increment.

---

## Phase 5 — Public site refactor

The blog list and individual post pages currently read from
`data/posts.js`. This phase replaces that with DB queries.

**5.1 — Refactor blog index.** `pages/blog/index.jsx` —
`getStaticProps` queries `prisma.post.findMany({ where: { status:
'PUBLISHED' }, orderBy: { publishedAt: 'desc' } })`. Returns
serializable post summaries.

**5.2 — Refactor blog post page.** `pages/blog/[slug].jsx` —
`getStaticPaths` queries all published slugs, `getStaticProps`
fetches one post by slug. `revalidate: 60` as a fallback in case
the on-demand revalidate call from Phase 4.6 misses. JSON-LD and
SEO from `<Seo>` already work; just need to map DB rows to the
data structure the existing component expects. The post page
also reads `post.views` from the DB row and displays it under
the meta line as `"1,243 views"` (formatted with `toLocaleString`
for thousand-separators). The view-increment call (Phase 4.7)
happens client-side after mount, so the count displayed on first
render is one fewer than the post-increment total until the
client's increment request returns. Acceptable: the displayed
number is the count from the last ISR regeneration, not
real-time. If you want real-time, drop the `revalidate: 60` and
switch to SSR — but that costs ~50ms per request for a number
that doesn't need to be exact.

**5.3 — Update sitemap.** `next-sitemap.config.cjs` — `additionalPaths`
queries `prisma.post.findMany` instead of importing the static
`POSTS` array. Each post's `lastmod` comes from `post.updatedAt`.

**5.4 — Delete `data/posts.js`.** Once nothing imports it, remove the
file. Migration is complete.

**5.5 — Backfill existing posts.** Optional one-time script that
takes the three posts currently in `data/posts.js` and inserts
them into the DB as `PUBLISHED` with `publishedAt` set to the
`date` field. Saves you from manually re-creating the existing
content in the admin UI.

**Done when:** the public blog reads from the DB, the sitemap
includes the right `lastmod` per post, and `data/posts.js` is
deleted.

---

## Phase 6 — Deployment wiring

Final pass to make it production-ready.

**6.1 — Vercel env vars.** Add all the values from the plan:
`DATABASE_URL`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DOMAIN`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `NEXTAUTH_SECRET`,
`NEXTAUTH_URL`, `AWS_SES_REGION`, `AWS_SES_FROM`, `ADMIN_EMAIL`.

**6.2 — Vercel function region.** `vercel.json` updates — add
`"regions": ["af-south-1"]` to the build config so serverless
functions run in the same region as RDS. Cuts ~200ms off every
DB query.

**6.3 — Database migration on deploy.** Add `prisma migrate
deploy` to a `postinstall` script in `package.json`. Vercel runs
it automatically on each deploy, applying any new migrations to
the production DB.

**6.4 — DEPLOY.md.** A walkthrough document covering: how to add
a new blog post, how to upload an image, how to rotate the RDS
password, how to rotate the IAM access keys, how to upgrade
Next.js, and what to do when the RDS free tier expires.

**6.5 — Security audit pass.** A checklist run on the deployed
site:

- `<link rel="canonical">` is set per page (already done in the
  SEO work).
- No `NEXT_PUBLIC_` env vars contain secrets.
- The `/admin/*` middleware redirects unauthenticated users.
- The single-user allowlist in the sign-in callback works.
- The pre-signed S3 URL expiry is 5 minutes.
- The bucket policy allows only CloudFront OAC.
- The IAM user policy grants only `s3:*` on the bucket and
  `secretsmanager:GetSecretValue` on the secret prefix.

**Done when:** the public site renders from DB data, the admin
works end-to-end, and `DEPLOY.md` exists for future maintainers
(including you, six months from now).

---

## Phases I'll deliver in one or more commits each

| Phase | Approx. commits | Approx. time |
|---|---|---|
| 1. Data layer | 1–2 | 30 min |
| 2. Auth | 1–2 | 45 min |
| 3. S3 uploads | 1 | 20 min |
| 4. Tiptap editor | 2–3 | 1.5 h |
| 5. Public refactor | 2 | 1 h |
| 6. Deployment | 1–2 | 30 min |

Total: ~5 hours of code, split across roughly 10 PR-sized commits so
you can review as I go.

## What you do in parallel

While I'm coding, you do these in the AWS Console:

- **Verify SES sender identity.** SES → Verified identities → Create
  identity → Email address → enter your admin email → AWS sends a
  verification link → click it. Without this, Phase 2.2 will fail
  silently.
- **Decide the S3 bucket name you'll use in production.** You have
  the long auto-suffixed name now. That's fine — use it as-is in
  env vars.
- **Pick `NEXTAUTH_SECRET`.** Run `openssl rand -base64 32` and
  save to 1Password. You'll add it to Vercel env vars in Phase 6.1.

## What you do NOT do

- Don't rotate the RDS password or IAM access keys again unless I
  tell you to. The current values are good until Phase 6.1.
- Don't change any AWS resource configurations (RDS, S3, IAM,
  CloudFront) without checking with me first. They're all wired
  correctly.
- Don't commit any new env files, keys, or ARNs to git. The
  pattern is `.env.example` with placeholders only, `.env.local`
  gitignored.

## When something breaks

- **DB connection fails locally.** Check Docker Compose is up
  (`docker compose ps`). If the container is up but Prisma can't
  connect, check `DATABASE_URL` in `.env.local`.
- **`prisma migrate dev` complains about drift.** You edited the
  schema without migrating. Run `npx prisma migrate dev` again,
  answer the prompts.
- **S3 upload returns 403.** Bucket policy missing or wrong
  account ID in `AWS:SourceAccount`. Verify in S3 → Permissions
  → Bucket policy.
- **Magic-link email never arrives.** SES sender identity not
  verified, or `AWS_SES_FROM` env var doesn't match the verified
  email. Check SES → Verified identities.
- **Image upload succeeds but URL returns 404.** CloudFront cache
  hasn't picked up the new prefix, or origin domain is wrong.
  Create an invalidation for `/*` and wait 60s.
- **View counter not incrementing on a real visit.** Confirm
  the visitor isn't matched by the bot regex (check
  `lib/views.js`'s `BOT_REGEX`). Confirm the request isn't from
  a signed-in session (the `getServerSession` check). Check
  Vercel function logs for the `POST /api/views/[slug]` call —
  if it's hitting 200 but the count doesn't change, the
  `increment: 1` query likely failed; check that the Prisma
  client is connected to the production DB.

---

## Done condition

The whole plan is "done" when:

- You can sign in to `/admin/login` with your email.
- You can create a draft, write a post with images, hit publish.
- The new post appears at `ilesanmi.vercel.app/blog/<slug>` within
  1 second of publishing.
- The sitemap updates with the new `lastmod`.
- The OG image for the new post renders with the post title and
  tags.
- A second user without your email cannot sign in.
- The DB password and IAM keys are in 1Password, not in code or
  chat.
