# Admin panel — setup & use

The admin panel lets you manage the site without touching code:
**components** (React and/or HTML/CSS/JS), **documents** (Markdown), **media** and **site settings**.

## 1. First-time setup (once)

```
cd uicomponents
npm install
npm run admin:create -- you@example.com
```
You'll be asked for a password (at least 10 characters; typing is hidden).
Run the same command again any time to reset a password (it also logs out every session).

## 2. Run it

```
npm run dev:all
```
- Site: http://localhost:5620
- Admin: http://localhost:5620/admin
- API: http://localhost:5621 (the site talks to it through `/api`)

`npm run dev` alone starts only the site: built-in components still work, uploaded content doesn't.

## 3. What you can do

| Area | What |
|---|---|
| Dashboard | Counts, recent changes, warnings about code that doesn't compile |
| Components | Create / edit / delete. Paste or **upload code files** (.tsx/.jsx, .css, index.html, style.css, .js, .md). Live preview while typing. Draft or Published. **History**: every save keeps the previous version (last 30); restore any of them. |
| Documents | Markdown pages with live preview, upload .md files, insert media. Published docs appear under “Docs” in the site menu. |
| Media | Upload images, PDFs, fonts, MP4 (max 15 MB each), copy their link, delete. |
| Settings | Site name, home page hero text, Pro plan (price, features, payment link), category names. |

Shortcuts: **Ctrl+S** saves in every editor. Leaving a page with unsaved changes asks first.

### Rules for uploaded React code
- One default-exported component. It may import only `react`, `react-dom` and its own CSS file.
- The server compiles it when you save. If it doesn't compile, it's still saved, the error is
  shown with the line number, and the React preview stays hidden on the site until it's fixed.
- Built-in components (files in `src/library`) are listed read-only. If an uploaded component
  uses the same slug as a built-in one, the built-in one is shown.

## 4. Security (what protects the site)
- Passwords are stored hashed (scrypt). Sessions use a random token in an HttpOnly,
  SameSite=Strict cookie (Secure on HTTPS); the database stores only a hash of it.
- 8 wrong logins from one IP (or 20 for one account) → blocked for 15 minutes.
- Every admin write must carry a special header that other websites can't add (CSRF protection).
- **Uploaded code never runs inside the site itself**: all previews run in sandboxed iframes, and
  compiled preview pages also send a `sandbox` Content-Security-Policy.
- Documents are sanitized before display (scripts and event handlers are removed).
- Media: only an allow-list of file types; SVGs are served with a locked-down policy.

## 5. Deploying (online) — Render

The project runs as **one Node 24 server** that serves the built site and the API.
`render.yaml` describes everything, so Render sets it up from the repo.

**Cost:** Starter instance (about $7/month) + 1 GB disk (about $0.25/month). The free plan has
no disk, so every restart would delete the database and uploads.

1. **GitHub:** create an empty private repository (no README), then from `uicomponents/`:
   ```
   git remote add origin https://github.com/<you>/uicomponents.git
   git push -u origin main
   ```
2. **Render:** dashboard → **New → Blueprint** → connect GitHub → pick the repo → Apply.
   It asks for three values (they stay in Render, never in git):
   - `SITE_URL`: leave empty for the first deploy (or your domain if you have one).
   - `ADMIN_EMAIL`: your admin email.
   - `ADMIN_PASSWORD`: a new strong password (10+ characters). Type it yourself.
3. Wait for **Live**. The log shows `✓ Admin created from environment`. Open
   `https://<name>.onrender.com/admin` and log in.
4. **Then, in Render → Environment:** delete `ADMIN_PASSWORD`, and set
   `SITE_URL=https://<name>.onrender.com` (or your domain). Save → it redeploys.
5. Submit `https://<your-address>/sitemap.xml` in Google Search Console.

Updates: every `git push` to `main` deploys again automatically. Data on the disk stays.

Notes
- `TRUST_PROXY=1` is set because Render's proxy sits in front: the login limit reads the IP that
  proxy added. Failed logins appear in Render → Logs as `[auth] failed login from <ip>`.
- Reset a password later: Render → Shell → `npm run admin:create -- you@example.com`
  (or set ADMIN_PASSWORD again only when no admin exists).
- Backups: Render keeps daily disk snapshots on paid plans; you can also download
  `/var/data/app.db` and `/var/data/uploads` from the Shell.
- Custom domain: Render → Settings → Custom Domains, add the DNS record it shows, then update
  `SITE_URL`. HTTPS is automatic.
- Other hosts work too (VPS, Railway, Fly.io): `npm ci --include=dev && npm run build`, then
  `NODE_ENV=production DATA_DIR=<persistent folder> SITE_URL=https://… npm start`.
  Keep the `src/` folder: the SEO pages read component names from `src/library`.

## 5b. Free Netlify address in front of Render

Visitors use `https://<name>.netlify.app`; Netlify forwards every request to Render and signs it.
Render then sends anyone who opens the `onrender.com` address directly over to the Netlify one.

1. `netlify.toml` (repo root): `to = "https://<name>.onrender.com/:splat"` must hold your Render address.
2. Make one long random secret (40+ characters) and keep it private. It goes in two places:
   - Netlify → Site configuration → Environment variables: `UIC_PROXY_SECRET`
   - Render → Environment: `PROXY_SIGNATURE_SECRET`
3. Netlify → Add new site → Import an existing project → GitHub → `UIcomponents` → Deploy
   (nothing to build; the settings come from `netlify.toml`). Optional: Site settings → change
   site name, e.g. `uicomponents.netlify.app`.
4. Render → Environment: `SITE_URL=https://<name>.netlify.app` → Save (redeploys).
5. Check: the Netlify address shows the site and `/admin` logs in; the onrender.com address
   redirects to Netlify.

How it's protected: without the secret, Render can't tell Netlify's requests from anyone else's.
With it, only signed requests are served; the login limit uses the visitor IP that Netlify reports.
`/api/health` stays open for Render's health check. If you change the secret, change it in both places.

## 6. Files
```
server/src/index.ts        server entry (API + static site in production)
server/src/db.ts           SQLite schema + migrations (add new migrations at the end)
server/src/auth.ts         passwords, sessions, guards, login rate limit
server/src/compile.ts      React upload compiler (esbuild) + preview page
server/src/proxy.ts        Netlify signed-proxy check (PROXY_SIGNATURE_SECRET)
netlify.toml               Netlify forwarding config (free *.netlify.app address)
server/src/routes/         auth, components, documents, media, site (settings, public feed)
server/scripts/create-admin.ts
src/admin/                 admin UI (lazy-loaded chunk)
src/data/                  public site ↔ API (SiteDataProvider merges built-in + uploaded)
```
