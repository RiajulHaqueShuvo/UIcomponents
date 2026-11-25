# UIComponents — Roadmap

A website that shows a library of animated UI pieces (text effects, animations,
backgrounds, buttons, cards, UI widgets), sorted by category. Each one has a live
preview, its source code and a copy button. UX reference: pro.reactbits.dev
(we copy the layout idea only; every component is our own code).

Status key: ✅ done · 🚧 in progress · ⏳ planned

---

## Phase 0 — Prototype (✅ 2026-11-25)
- ✅ Quick Vite + React (JS) prototype with 6 text components
- ✅ Decided to rebuild with a proper structure (Phase 1)

## Phase 1 — Foundation (rebuild) (✅ 2026-11-25)
- Vite + React 19 + **TypeScript (strict)**
- Folder layout:
  ```
  src/
    app/            App, router, layout
    site/           website pieces (Sidebar, Header, Preview, CodeBlock, PropsTable…)
    library/        the components we ship, one folder each:
      <category>/<Name>/
        <Name>.tsx  the component (the code users copy)
        <Name>.css  its styles (class names prefixed with the component name)
        meta.ts     name, description, props table, usage snippet
    registry/       auto-discovers every library/*/*/meta.ts (import.meta.glob)
    styles/         site theme tokens and global CSS
  ```
- **One source of truth:** the preview renders the real component, and the Code
  tab shows the same file through Vite `?raw`. They can never drift apart.
- Adding a component = add one folder. No central list to edit.
- Routing: `react-router` with hash URLs (`#/components/split-text`), so it works
  on any static host.

## Phase 2 — Component library v1 (26 components) (✅ 2026-11-25)
| Category | Components |
|---|---|
| Text Animations | Split Text, Gradient Text, Shiny Text, Typewriter, Decrypted Text, Count Up |
| Animations | Magnet, Click Spark, Marquee, Fade In |
| Backgrounds | Aurora, Particles, Dot Grid |
| Buttons | Glow Button, Ripple Button, Fill Button |
| Cards | Tilt Card, Spotlight Card, Flip Card, Glass Card, Pricing Card, Profile Card |
| UI Components | Dock, Animated Tabs, Accordion, Toggle |

## Phase 3 — Website features (🚧 almost done)
- ✅ Sidebar by category with counts, search (`Ctrl+K` / `/`)
- ✅ Home page: hero + gallery of every component with live thumbnails
- ✅ Component page: Preview / Code tabs, Replay button, file tabs (TSX / CSS),
  copy button, usage snippet, props table, previous / next links
- ✅ Responsive layout (sidebar becomes a drawer on mobile)
- ⏳ Respects `prefers-reduced-motion`

## Phase 4 — Customize playground, Pro feature (✅ 2026-11-25, demo unlock)
- ✅ "Customize" tab (marked PRO) on every component page
- ✅ Live controls per component (sliders, colours, text, lists, switches) from `meta.ts` `controls`
- ✅ Ready-to-paste code file generated from the chosen options
- ✅ Locked for free users: blurred controls, "Unlock Customize" button, Upgrade modal
- ✅ All Pro checks go through one module (`src/premium/`), so real payments plug in there

## Phase 4b — Real Pro sales (⏳, needs business decisions)
- Choose a payment provider (Stripe / LemonSqueezy / SSLCommerz / bKash) and the final price
- Add user accounts (sign in) so Pro follows the person, not the browser
- Small backend: payment webhook → mark user as Pro → site asks the server "is this user Pro?"
- Remove the demo unlock button
- Note: until then, the Pro lock runs in the browser only, so anyone with dev tools can open it

## Phase 4c — Multi-language components (✅ 2026-11-25)
- ✅ React and/or HTML/CSS/JS version per component, with a language switch
- ✅ Sandboxed iframe preview for HTML versions
- ✅ `npm run new` scaffold + ADDING-COMPONENTS.md upload guide
- ⏳ Add HTML versions for the other 23 React components
- ⏳ Optional later: Vue / Svelte / Tailwind versions using the same variant system

## Phase 4d — Tools: Color Palette Studio (✅ 2026-11-25)
- ✅ Colours with % shares → roles → live banner / website / proportion demos
- ✅ Readability + proportion checks, presets, random, export, share links
- ⏳ Ideas: "Apply palette to components" (recolour the library previews), download banner as PNG,
  more demo layouts (mobile app, social post, email), save favourite palettes

## Phase 7 — Admin panel + backend (✅ v1 2026-11-25)
Decision: **online admin with our own backend** (not a hosted service), so it runs locally
now and deploys to any Node host later. Scope v1: components, documents, site settings, media.

Architecture
```
server/                      Node 24 (runs TypeScript directly, no build step)
  src/db.ts                  SQLite (node:sqlite) schema + migrations
  src/auth.ts                scrypt passwords, sessions (httpOnly cookie), login rate limit
  src/http.ts                tiny router, JSON/body/cookie helpers, security headers
  src/compile.ts             esbuild: uploaded React code → sandboxed preview bundle
  src/routes/*.ts            auth, components, documents, settings, media, public
  data/                      app.db + uploads/ (git-ignored)
src/admin/                   admin UI at #/admin (lazy-loaded, not in the public bundle)
src/data/                    public site loads published server content at runtime
```
Security rules
- Uploaded code never runs in the main site: HTML and compiled React previews run in
  `sandbox="allow-scripts"` iframes, and preview pages also send a CSP sandbox header.
- Only logged-in admins can write. SameSite=Strict cookie + JSON-only writes (CSRF).
- Media: type allow-list, size limit, `nosniff`, SVG served with a locked-down CSP.

Steps
- ✅ Plan + runtime checks (node:sqlite, TS stripping, esbuild)
- ✅ Server foundation: DB, auth, router
- ✅ APIs: components (+ revisions), documents, settings, media, public
- ✅ React upload compiler + preview pages
- ✅ Public site reads server content (merged with built-in library), docs pages, settings
- ✅ Admin UI: login, dashboard, component editor, docs editor, media library, settings
- ✅ Setup + deploy guide: ADMIN.md
- ✅ Customize (Pro) for uploaded React components (2026-11-25)
- ✅ Security hardening pass (2026-11-25)
- ✅ SEO: real URLs, server-rendered meta + content, JSON-LD, sitemap, robots (2026-11-25)
- ⏳ Next: Open Graph share image, multiple admin users/roles, audit log, automatic backups, image resizing/thumbnails,
  real Pro payments (Phase 4b) on top of this backend

## Phase 2b — Old work imported (✅ 2026-11-25)
- ✅ 18 HTML/CSS/JS components from the old UI-component- repo; new Sliders & Galleries category
- ✅ Image/video assets per component, compressed (130 MB → 23 MB)
- ⏳ Split the bundle (component sources load per page)

## Phase 5 — More content (⏳)
- New categories: Navbars, Heroes, Forms, Loaders, Modals, Testimonials, Footers
- Tailwind versions of each component (second code tab)
- "New" badges and a changelog page

## Phase 6 — Launch (🚧)
- ✅ Deploy setup for Render: `render.yaml`, health check, persistent disk, first admin from env (2026-11-25)
- ✅ Pushed to GitHub (private) + Render deploy (2026-11-25)
- ✅ Free Netlify front address for Render, signed proxy (built, not connected)
- 🚧 Public static version on GitHub Pages: workflow + per-page SEO export (2026-11-25)
- ⏳ Set SITE_URL, submit sitemap to Google
- ⏳ Custom domain, Open Graph image, analytics, disk backups
- Optional: Pro tier / paid blocks (needs a business decision)
