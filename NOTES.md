# UIComponents — Work Notes

A dated log of every piece of work. The plan lives in [ROADMAP.md](ROADMAP.md).

## How to run
```
cd uicomponents
npm install        # first time only
npm run dev        # http://localhost:5620
npm run build      # typecheck + production build
```
(In the Claude app, the dev server is also the `uicomponents` entry in `.claude/launch.json`.)

## How to add a new component
Full guide: [ADDING-COMPONENTS.md](ADDING-COMPONENTS.md). Short version:
`npm run new -- <category> <Name> [--react] [--html]`, then paste your code over the starter files.

---

## Log

### 2026-11-25 — Prototype (Phase 0) ✅
- Vite + React (JS) project, 6 text components. Paused while the video work finished.

### 2026-11-25 — Rebuild: Foundation (Phase 1) ✅
- Switched to TypeScript (strict). Added react-router (hash URLs) and sugar-high (code highlighting).
- New structure: `src/app` (router, layout), `src/site` (website UI), `src/library` (components),
  `src/registry` (auto-discovery + types), `src/styles` (theme tokens).
- Registry finds each component folder through `import.meta.glob`. The preview and the Code
  tab both use the same file, so they can't drift apart.
- Removed the old `src/components` prototype folder.

### 2026-11-25 — Component library v1 (Phase 2) ✅ — 26 components
- Text Animations (6): Split Text, Gradient Text, Shiny Text, Typewriter, Decrypted Text, Count Up
- Animations (4): Magnet, Click Spark, Marquee, Fade In
- Backgrounds (3): Aurora, Particles, Dot Grid
- Buttons (3): Glow Button, Ripple Button, Fill Button
- Cards (6): Tilt Card, Spotlight Card, Flip Card, Glass Card, Pricing Card, Profile Card
- UI Components (4): Dock, Animated Tabs, Accordion, Toggle

### 2026-11-25 — Website features (Phase 3) ✅ mostly
- Done: sidebar by category with counts, search (Ctrl+K or /), home hero + live gallery,
  component page (Preview/Code tabs, Replay, file tabs, Copy, Usage, Props table, Installation,
  previous/next), 404 page, mobile drawer.
- Not done yet: `prefers-reduced-motion` support (moved to the next session).

### 2026-11-25 — Checks ✅
- `npm run build` (TypeScript + Vite) passes.
- Browser check: all 26 pages render with no console errors; search, Toggle, Code tab,
  Copy button and the mobile menu work.
- Bugs found and fixed:
  1. After going from a scrolled page to a component page, the page stayed scrolled down
     (smooth scrolling), so scroll-triggered previews (Count Up, Fade In) never started.
     Fix: instant scroll-to-top on route change (`src/app/Layout.tsx`).
  2. On mobile, wide demos (Dock) were clipped on both sides. Fix: preview stage now
     scrolls sideways and uses `align-items: safe center`.

### 2026-11-25 — Customize (Pro feature, Phase 4) ✅
- New "Customize" tab (PRO badge) on every component: live preview + options panel
  (text, sliders with number box, colour pickers, colour lists, word lists, switches, dropdowns).
- "Your code" shows a ready-to-paste `<Name>Demo.tsx` built from the chosen options; Reset button.
- Free users see the panel blurred and locked, with an "Unlock Customize" button → Upgrade modal
  (price, features, "Buy Pro" disabled until a payment link is set, and "Try Pro free (demo mode)").
- Header: "Go Pro" button; shows "PRO · demo" when unlocked (click it to turn demo off).
- Files: `src/premium/` (config.ts = price/features/checkout link, PremiumProvider.tsx,
  context.ts, UpgradeModal.tsx), `src/site/playground/` (Playground, ControlField, codegen).
- Each component's options live in its `meta.ts` under `controls`.
- Checked: build passes; on all 26 components the Customize tab renders, options update the
  preview, code is generated, and there are no console errors; lock → demo unlock → edit flow works.
- ⚠️ The Pro lock currently runs only in the browser (demo). Real selling needs a payment
  provider + server check: see ROADMAP Phase 4b.

### How to add options to a component
In its `meta.ts`, add `controls: [{ prop, label, type, default, ... }]`. Types: `text`,
`number` (min/max/step/unit), `color`, `boolean`, `select` (options), `colorList`, `textList`.
The `default` must match the component's own default.

### 2026-11-25 — Multi-language components (React + HTML/CSS/JS) ✅
- A component folder can now hold a React version, an HTML/CSS/JS version (`html/index.html`,
  `style.css`, `script.js`), or both. Registry builds a "variant" for each.
- HTML versions preview in a sandboxed iframe (`sandbox="allow-scripts"`, no same-origin), so
  uploaded JavaScript runs but can't reach the site. Files are inlined for the preview only;
  the Code tab shows the original files.
- Component page: language chips, a React ↔ HTML/CSS/JS switch (preview + code follow it),
  the choice is remembered across pages, and falls back when a component lacks that version.
  Usage/Installation adapt per language; Customize (Pro) stays React-only.
- Home tiles show React / HTML chips; HTML-only tiles preview in a lazy iframe.
- Examples: HTML versions added to Shiny Text, Glow Button, Spotlight Card; new HTML-only
  **Like Button** (27 components now).
- New `npm run new -- <category> <Name> [--react] [--html]` scaffold + ADDING-COMPONENTS.md.
- Checked: build passes; all 27 pages render in every language they have with no errors;
  language switch, remembered choice and fallback work; the Like Button script runs inside the
  sandbox (128 → 129); the scaffold output builds and shows up on the site.
- Bug fixed: the iframe was painted white because its colour scheme didn't match → the frame
  now declares `color-scheme: dark`.

### 2026-11-25 — Color Palette Studio (new tool) ✅
- New menu section **Tools → Color Palette** (also a header link). Page: `#/palette`.
- Pick 2–6 colours and give each a share (%). Shares decide the role: biggest = Background,
  then Surface, Primary (buttons), Accent, Highlight. "Balance to 100%" fixes the total.
- Live demos with the same colours: **Banner** (sale banner), **Website** (landing page with
  nav, hero, feature cards, stats strip, footer), **Proportions** (blocks sized by share).
  Brand name and headline are editable for showing clients.
- "How will it look?": mood line, 60/30/10 check, accent/too-many-colours warnings, and WCAG
  contrast checks (text, surface text, button text, button vs background) with a verdict.
- Text colour: automatic (most readable neutral) or custom.
- 7 presets + Random. Export as CSS variables / Tailwind / JSON. The URL always holds the
  palette (e.g. `#/palette?c=0b0b12-60_1e1b4b-28_a78bfa-9`), so the share link reopens it.
- Files: `src/palette/` (color.ts maths, model.ts roles/insights/share links, presets.ts,
  PaletteEditor, demos, Insights, ExportPanel, PalettePage, palette.css).
- Checked: build passes, no console errors; share link loads, editing shares re-ranks roles
  and recolours demos, Balance, hex validation, add/remove, Random, all 3 views, export.
- Fixes during testing: body text could become a bright accent colour (now only neutral
  colours are used for text); share links had `%2C` (now `_` separators); Forest preset
  had low-contrast buttons (preset corrected).

### 2026-11-25 — Admin panel + backend v1 (Phase 7) ✅
- Decision (user): online admin with a backend. Built our own Node 24 server (TypeScript run
  directly, SQLite via node:sqlite, esbuild) instead of a hosted service: no account needed,
  deploys to any Node host. Full guide: [ADMIN.md](ADMIN.md).
- Server (`server/`): migrations, scrypt passwords, hashed session tokens in HttpOnly
  SameSite=Strict cookies, login rate limit, CSRF header, tiny router, security headers;
  APIs for components (+ 30-version history and restore), documents, media, settings,
  stats and one public feed; production mode serves the built site too.
- Uploaded React code is compiled on the server into a self-contained bundle and only ever
  runs in sandboxed iframes; only `react`/`react-dom` imports allowed; errors keep line numbers.
- Site: `SiteDataProvider` merges built-in + published uploaded components; settings drive
  site name, hero, Pro plan and category names; new Docs pages (sanitized Markdown, lazy chunk).
- Admin UI at `#/admin` (separate lazy chunk, noindex): login, dashboard, components list +
  editor (code tabs, file upload, starters, live preview, history), documents (Markdown + live
  preview + .md upload + insert media), media library (drag & drop), settings. Ctrl+S, unsaved
  changes warning, toasts.
- New scripts: `npm run dev:all` (site + API), `npm run admin:create -- email`, `npm start`.
- Checked: web + server typecheck; build passes (admin 37 KB and Markdown 71 KB load
  separately); 32-check API test (auth, CSRF, validation, compile errors, revisions, media
  types, path traversal, public feed); full browser run: login → create React component →
  live preview → broken import error → history restore → HTML version → media upload →
  document with image (script injection stripped) → settings (bad link rejected) → all of it
  visible on the public site; production mode serving + caching + traversal checks; no errors
  on all 29 public pages.
- Bugs fixed during testing: restore didn't keep the replaced version (now it does); API
  took the site's port when a launcher set PORT (dev runner now pins 5621); public preview
  frame was blank (sandboxed page + frame-ancestors / embedded-browser frame blocking → previews
  now load via srcdoc); asset caching never applied on Windows (path separator).
- All test data, the test admin and its password file were deleted afterwards. The user
  creates their own admin with `npm run admin:create`.

### 2026-11-25 — Owner admin account created ✅
- Admin account created for the owner's email (at their request) with a temporary random
  password, stored only in `server/data/TEMP-ADMIN-PASSWORD.txt` (git-ignored).
  ⚠️ Change it with `npm run admin:create -- <email>` and then delete that file.
- Tested with this account: login, create + publish component (React + HTML), public preview,
  edit + history, document, media upload/serve/delete, settings. Test content deleted afterwards.

### 2026-11-25 — Customize for uploads, security hardening, SEO ✅
**Customize (Pro) for uploaded React components**
- The playground sends options into the sandboxed preview with postMessage; the compiled
  preview remounts on each update (same behaviour as built-in components) and only accepts
  messages from its parent page. Generated code works the same as for built-ins.

**Security review → fixes**
- Login rate limit could be bypassed with a fake `X-Forwarded-For` → proxy headers trusted
  only with `TRUST_PROXY=1`; added a per-account limit (20/15 min) next to per-IP (8/15 min);
  limiter memory is swept and capped.
- React upload import allow-list was a prefix match (`react/...`) → exact list only.
- Security headers: CSP (object-src none, base-uri, form-action, frame-ancestors none),
  X-Frame-Options DENY, HSTS on HTTPS, Permissions-Policy, COOP, X-Robots-Tag on API/admin.
  (CSP can't ban inline scripts because sandboxed srcdoc previews inherit it.)
- All uploaded files are served with a sandbox CSP (not only SVG).
- Malformed URLs → 400 instead of 500; slow-request timeouts; `__Host-` session cookie on HTTPS.
- Checked: code highlighter escapes uploaded code (no XSS); npm audit: 0 vulnerabilities.

**SEO**
- Real URLs (`/components/split-text`) instead of `#/…`; old hash links redirect automatically.
- Production server answers every page with: its own title, description, canonical,
  Open Graph/Twitter tags, JSON-LD (WebSite / SoftwareSourceCode + BreadcrumbList /
  TechArticle) and plain HTML content (headings + links to every component) inside #root.
  Unknown pages return a real 404 with noindex. `/sitemap.xml` (home, palette, every component,
  docs) and `/robots.txt` (blocks /admin and /api).
- Client keeps the same tags updated while navigating (`useSeo`). Favicon, theme-color.
- Set `SITE_URL=https://your-domain` in production so canonical/sitemap links use the real domain.

**Tests**: typechecks + build; production run (titles, 200/404 codes, JSON-LD, sitemap 30 URLs,
robots, headers, favicon); rate limit with faked IPs (blocked at attempt 9); import allow-list
(4 blocked, react-dom/client allowed); upload CSP (md, svg with script); browser: hash redirect,
per-page meta, 404 noindex, Customize on an uploaded component (label/colour/size updated the
sandboxed preview), admin under /admin, no errors on 30 pages. Test content deleted.

### 2026-11-25 — Deploy setup (Render)
Decision: host on **Render** (Node web service + 1 GB persistent disk, Starter plan, Singapore).
Free Render instances have no disk, so the database and uploads would be wiped; Netlify can only
host static files, so it can't run the admin/API. Netlify could later sit in front as a domain/CDN.
- `render.yaml` Blueprint: build `npm ci --include=dev && npm run build`, start `npm start`,
  health check `/api/health`, disk at `/var/data`, env NODE_VERSION=24, NODE_ENV, DATA_DIR,
  TRUST_PROXY=1, and SITE_URL / ADMIN_EMAIL / ADMIN_PASSWORD entered in the dashboard (never in git).
- First admin without a shell: on start, if there are no users and ADMIN_EMAIL + ADMIN_PASSWORD are
  set, the server creates that admin once and then warns until ADMIN_PASSWORD is removed.
- `TRUST_PROXY` is now a hop count. The client IP is read from the right end of X-Forwarded-For
  (the entry our proxy added), so a faked leftmost IP can't dodge the login limit any more.
- Failed logins are logged with the IP (`[auth] failed login from …`) for the host's log view.
- New `GET /api/health`. `.gitattributes` keeps LF line endings. Project is now a git repo.
- Tests: production run on a test port with a throwaway data folder: health ok, home and component
  pages 200, admin created from env, good login 200, 9 bad logins with changing fake leftmost IPs
  blocked at the 9th (logged as the real IP), another IP still allowed. Test data deleted.

### 2026-11-25 — GitHub + Netlify address
- Privacy scan before the first push: no emails, passwords, keys, tokens or personal paths in tracked
  files; server/data, .env, node_modules, dist ignored. The commit author email was changed to the
  GitHub noreply address (repo-local git config). Added README.md.
- Security check: npm audit 0; all admin writes guarded (session + X-UIC-Admin); Markdown sanitized
  (DOMPurify); upload names strictly matched; uploads served with a sandbox CSP; API `no-store`.
- Pushed to the private repo RiajulHaqueShuvo/UIcomponents (main). Render deployed from it.
- Decision: **Netlify as a free front address** for the Render server (user choice, option 1).
  `netlify.toml` forwards `/*` to Render with `signed = "UIC_PROXY_SECRET"`. New `server/src/proxy.ts`
  checks Netlify's HS256 `X-Nf-Sign` (PROXY_SIGNATURE_SECRET); unsigned GETs → 301 to SITE_URL,
  unsigned writes → 403, `/api/health` exempt; login limit uses `X-Nf-Client-Connection-Ip` on
  signed requests. Off until the secret is set, so the Render deploy keeps working meanwhile.
- Tests (local production run): direct GET 301 with path + query kept, direct POST 403, health 200,
  valid signature 200, wrong secret / expired / garbage token 301, 9 signed bad logins from one
  Netlify-reported IP with changing X-Forwarded-For blocked at the 9th, canonical uses SITE_URL.

### 2026-11-25 — Public version on GitHub Pages
Decision (user): uploading to Netlify/Render didn't work out, so publish the frontend from GitHub.
GitHub Pages is static, so this is the **static version**: built-in library, palette, Customize demo.
Admin, uploads and docs stay for the Node version (Render/Netlify setup kept, unused for now).
- `src/app/env.ts`: `BASE` (Vite base, `/UIcomponents`) and `STATIC` (`VITE_STATIC=1`). Router
  `basename`, hash-link redirect, palette share link and canonical URLs use BASE. Static mode skips
  the `/api` call and shows a note instead of the admin.
- `vite.config.ts` base from `BASE_PATH`. Server SEO fallback links get `config.basePath`.
- `scripts/export-pages.ts` (+ `npm run build:pages`): renders every sitemap page through the server's
  SEO renderer into `components/<slug>.html` etc. (Pages serves them without a redirect), `404.html`,
  `sitemap.xml`, `.nojekyll`. Uses a throwaway empty database.
- `.github/workflows/pages.yml`: Node 24, `npm ci`, build:pages, deploy-pages on push to main.
- Tests: 29 pages + 404 + sitemap exported with per-page title/canonical and `/UIcomponents/` assets;
  browser through a Pages-like local server: component pages, sidebar links, palette share URL,
  HTML variant iframe, Customize tab, 404 page, old `#/` link redirect, admin note, no `/api` calls,
  no errors besides the two intended 404 pages.
- Note: a public repo makes the code readable; the Pro demo unlock was already browser-only.

## Next up (pick from ROADMAP.md)
- Make the repo public + enable Pages (ADMIN.md §4b), then submit the sitemap to Google
- Later, for admin online: Render (+ optional Netlify, §5/§5b)
- Change the temporary local admin password, then add real content
- Open Graph share image, backups of the Render disk
- Phase 4b: real Pro sales (payment provider, accounts, server check)
- Phase 3 leftover: reduced-motion support
- Phase 5: more categories (Navbars, Heroes, Loaders, Forms…)
- Phase 6: custom domain
