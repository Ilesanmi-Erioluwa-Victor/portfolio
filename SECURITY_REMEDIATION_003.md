# Security Remediation 003 — SEC-003 (S3 upload hardening)

- Date: 2026-09-09
- Scope: SEC-003 ONLY. Editor UX unchanged apart from the PUT→POST transport swap. SEC-004+ untouched.

## Old upload flow

Browser compressed to webp → `POST /api/admin/upload {kind, filename, contentType, postSlug}` → server trusted all three, built a **deterministic** key (`blog/coverImages/<slug>.<ext>`, `Math.random()` inline) → returned presigned **PUT** (`uploadUrl`, any `Content-Type`, no size bound) → browser PUT bytes → CloudFront URL stored. Any session could overwrite any post's cover; `text/html`/SVG uploads served executably from the trusted CDN host.

## New upload flow

Browser compresses to webp → `POST /api/admin/upload {kind, filename, contentType, postSlug}` → server authenticates, resolves ownership, validates type/extension, mints a **presigned POST** bound to exact `Content-Type` + `content-length-range 1–5MB` with a **server-generated UUID key** → browser POSTs multipart form → CloudFront URL stored. `coverImage` writes are host-pinned in PATCH.

## MIME allowlist

`image/jpeg`, `image/png`, `image/webp`, `image/gif` — nothing else. `text/html`, `text/plain`, `application/javascript`, `image/svg+xml`, `application/xhtml+xml`, `application/pdf`, executables, and unknown types all return 400. SVG deliberately excluded (no safe inline-SVG architecture in this codebase).

## Extension rules

Bidirectional map (`jpg/jpeg→image/jpeg`, `png`, `webp`, `gif`). Extension taken from the client filename **only for cross-checking**: unknown extensions (`.html`, `.svg`, …) → 400; known extension mapping to a different MIME → 400. The stored extension always derives from the validated MIME, never from user input; raw filenames never touch the key.

## Size limit

5 MB (`MAX_UPLOAD_BYTES`, matching the editor's 5 MB client check; compressor targets ~1 MB). Enforced **by S3 itself** via the `content-length-range` POST-policy condition — not merely client-checked. (Presigned PUT was replaced precisely because it cannot bind a size condition.)

## Object-key strategy

`blog/coverImages/<uuid>.<ext>` / `blog/postImages/<uuid>.<ext>` via `crypto.randomUUID()`. Client input contributes zero characters. 50/50 unique in tests. Old deterministic `…/<slug>.<ext>` scheme removed, so cross-post overwrite by slug-guessing is impossible.

## Authorization logic

1. `getServerSession` → 401 when absent (verified live, valid and evil bodies).
2. Resolve `authorId` (session id, email fallback) → 401 when unresolvable.
3. Cover requires `postSlug`; any supplied `postSlug` must exist (404) **and** belong to the caller (403).
4. `PATCH /api/admin/posts/[id]` still enforces its own `authorId` ownership check, and now additionally rejects `coverImage` values not hosted on `https://<AWS_CLOUDFRONT_DOMAIN>/` (400; empty string still clears).

## CloudFront considerations

Objects now can only exist as `image/*` with S3-stored `Content-Type`, so CloudFront serves them as inert images (SVG/HTML upload path closed). Recommended follow-up outside this repo (AWS console, documented as remaining): attach a CloudFront response-headers policy adding `X-Content-Type-Options: nosniff` to the image behaviors for MIME-sniffing defense in depth.

## Tests

- `npm run test:upload` — 27/27 pass: 4 valid types (+jpeg alias, no-filename), `.html/.svg/.js/.pdf/.txt/.xhtml`/octet-stream/empty MIME → 400, 3 MIME/ext mismatches → 400, bad/missing kind → 400, 50-key uniqueness, 5 MB constant, 6 cover-URL cases (evil host, http downgrade, subdomain-confusion `…net.evil.com`, non-string rejected).
- Live (local dev, no DB touched): unauthenticated POST with valid and evil bodies → both `401 {"error":"Unauthorized"}`.
- Not executed live (would touch prod data or need a real session): missing-post 404, foreign-post 403, oversized POST rejection by S3 — covered by code-path unit logic; verify in staging with a second test user before relying on them.
- No malicious files uploaded anywhere; all dangerous-input tests run against the pure validator.
- Regression: `npm run build` EXIT 0 (13/13 pages, sitemap), `npm run lint` clean except the pre-existing `[slug].jsx` warning.

## Remaining risks

- Legacy dead file `components/editor/TiptapEditor.jsx` still speaks the old `{uploadUrl}` PUT shape — unimported anywhere (verified), but delete or port it if ever revived.
- S3 pre-signed POST policy expiry is 300 s; keys are unguessable but URLs are bearer-capable within that window (inherent to presigns).
- No rate limit on the presign endpoint itself (SEC-006 territory).
- Bucket/CORS/policies and the CloudFront header policy above live in AWS console, not in code — confirm `s3:PutObject` scoped to `blog/*` and CORS origins limited to the app + localhost.
