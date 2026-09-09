# Security Remediation 002 — SEC-002 (Stored XSS)

- Date: 2026-09-09
- Scope: SEC-002 ONLY. Editor UX untouched. No other findings fixed.

## Root cause

`contentHtml` traveled client → `pages/api/admin/posts/*` → Postgres → `pages/blog/[slug].jsx: dangerouslySetInnerHTML` with no sanitizer anywhere (verified: no dompurify/sanitize-html in repo). Tiptap's `Link` had no protocol guard, so `javascript:` URLs persisted and rendered.

## Sanitizer selected

**`sanitize-html` 2.17.5** (allowlist-based, actively maintained). Chosen over DOMPurify+jsdom because it is pure Node (no jsdom in serverless), works in both runtimes used here (Node API routes/`getStaticProps` and the browser editor bundle), and supports per-tag schemes plus regex-constrained `style` — needed for Tiptap's `text-align` output.

## Files changed

- `lib/sanitize.js` (new): `sanitizePostHtml()` + exported `SANITIZE_RULES`
- `lib/tiptap-render.js`: `renderTiptapToHtml` returns sanitized HTML (covers autosave, save, admin preview)
- `pages/api/admin/posts/index.js`: POST sanitizes `contentHtml` on write
- `pages/api/admin/posts/[id].js`: PATCH sanitizes `contentHtml` on write
- `pages/blog/[slug].jsx`: `getStaticProps` re-sanitizes on read (defense in depth for pre-existing rows)
- `scripts/test-xss-payloads.js` (new), `scripts/sanitize-posts.js` (new)
- `package.json` / `package-lock.json`: +`sanitize-html`, +`test:xss` / `db:sanitize` scripts

## Allowed HTML elements

`h1-h6, p, br, ul, ol, li, blockquote, pre, code, span, strong, b, em, i, u, s, strike, a, img, table, thead, tbody, tr, th, td, hr`

## Allowed attributes

- `a`: href, title, target, rel, class
- `img`: src, alt, title, width, height, class, data-align
- `code/span/pre`: class (lowlight `language-*` / `hljs-*`)
- `th/td`: colspan, rowspan
- `p,h1-h6`: style (only via allowedStyles below; required — Tiptap TextAlign emits `style="text-align:…"`)

Everything else dropped, including all `on*` handlers. `script/style/form/object/embed/iframe/svg` tags are not listed, so they (and `script`/`style` contents) are discarded.

## Allowed protocols

- Global: `http, https, mailto, tel`. `javascript:`, `vbscript:`, `data:text/html` stripped from `href` (link text preserved).
- `img` additionally allows `data:` (legacy base64 posts keep working; scripts in `img`-loaded SVG do not execute). Protocol-relative URLs rejected.

## Dangerous payload test results (`npm run test:xss` — 22/22 pass)

| Payload | Result |
|---|---|
| `<img src=x onerror=alert(1)>` | handler stripped, inert img kept |
| `<a href="javascript:alert(1)">` | scheme stripped, text kept |
| `<script>alert(1)</script>` | tag + contents removed |
| `<svg onload=alert(1)>` | tag removed |
| `<div onclick>` | handler stripped, text kept |
| `<iframe src="javascript:…">` | removed |
| `vbscript:` / `data:text/html` links | schemes stripped |
| hostile `style` / `<form><object><input>` / `<style>` | neutralized |
| Regression: headings, bold/italic/underline/strike/code, lists, quote, safe + mailto links, CloudFront image w/ width + data-align, lowlight code block, table, text-align, hr | all preserved |

## Regression test results

- `npm run build`: EXIT 0, 13/13 static pages, sitemap ok
- `npm run lint`: pass (1 pre-existing `exhaustive-deps` warning in `blog/[slug].jsx`, unrelated)
- Live-post check: sanitizer dry-run diffed the single published post — the only change site-wide was `<img …>` → `<img … />` (self-closing normalization). No legitimate formatting altered.

## Database migration considerations

- No blind migration performed. `scripts/sanitize-posts.js` defaults to **dry-run report** (`npm run db:sanitize`); `--apply` writes only rows whose output differs, logging each slug.
- Applied once here (`--apply`): 1/1 posts, cosmetic-only diff above. Future writes are sanitized at the API, and reads re-sanitize, so legacy rows are safe even if never rewritten.
- `contentJson` left untouched (source of truth for re-editing); only rendered/stored HTML is normalized.

## Constraints honored

- Editor not redesigned (no changes to toolbar/extensions); blacklist-only approach not used (strict tag/attribute/protocol allowlists).
- SEC-003+ untouched. Note: SEC-003 (arbitrary upload content types) remains the complementary vector — e.g. an SVG/HTML file served from CloudFront bypasses this HTML-layer fix by design.
