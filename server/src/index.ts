import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type ServerResponse } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { hashPassword, purgeExpiredSessions, sweepLoginAttempts, userFromRequest } from './auth.ts';
import { config } from './config.ts';
import { db, now } from './db.ts';
import { HttpError, Router, sendJson, type Ctx } from './http.ts';
import { authRoutes } from './routes/auth.ts';
import { componentRoutes } from './routes/components.ts';
import { documentRoutes } from './routes/documents.ts';
import { mediaRoutes, serveUpload } from './routes/media.ts';
import { siteRoutes } from './routes/site.ts';
import { isSignedByProxy, proxyGuardOn } from './proxy.ts';
import { renderPage, robots, sitemap } from './seo.ts';

const router = new Router();
authRoutes(router);
componentRoutes(router);
documentRoutes(router);
mediaRoutes(router);
siteRoutes(router);

const STATIC_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/* ---------- Security headers ---------- */

function baseHeaders(res: ServerResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (config.cookieSecure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

/**
 * Page CSP. Note: component previews run in srcdoc iframes, which inherit this
 * policy, so it can't forbid inline scripts (previews need them). It still
 * blocks plugins, <base> hijacking, foreign form targets and clickjacking.
 */
const PAGE_CSP = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(config.cookieSecure ? ['upgrade-insecure-requests'] : []),
].join('; ');

/* ---------- Production: built site + SEO ---------- */

async function serveSite(ctx: Ctx): Promise<boolean> {
  const pathname = ctx.url.pathname;

  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    const isXml = pathname.endsWith('.xml');
    const body = isXml ? await sitemap(ctx.req) : robots(ctx.req);
    ctx.res.writeHead(200, {
      'Content-Type': isXml ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
    ctx.res.end(body);
    return true;
  }

  // Real files (hashed assets, favicon…).
  const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  const path = join(config.distDir, rel);
  if (path !== config.distDir && !path.startsWith(config.distDir + sep)) return false; // traversal
  const info = rel && rel !== 'index.html' ? await stat(path).catch(() => null) : null;
  if (info?.isFile()) {
    // Vite puts hashed (never-changing) files in dist/assets.
    const isAsset = path.startsWith(join(config.distDir, 'assets') + sep);
    ctx.res.writeHead(200, {
      'Content-Type': STATIC_TYPES[extname(path)] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    });
    createReadStream(path).pipe(ctx.res);
    return true;
  }

  // Any other path is a page: the app plus this page's SEO tags and content.
  if (extname(pathname)) return false; // e.g. /missing.png → 404, not the app
  const page = await renderPage(ctx.req, pathname);
  if (!page) return false;
  ctx.res.writeHead(page.status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Content-Security-Policy': PAGE_CSP,
    'X-Frame-Options': 'DENY',
    ...(pathname === '/admin' || pathname.startsWith('/admin/') ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
  });
  ctx.res.end(page.html);
  return true;
}

/* ---------- Server ---------- */

const server = createServer(async (req, res) => {
  const ctx: Ctx = {
    req,
    res,
    url: new URL(req.url ?? '/', 'http://localhost'),
    params: {},
    user: null,
  };
  baseHeaders(res);

  try {
    const path = ctx.url.pathname;
    // Behind Netlify: requests that skipped Netlify go to the public address instead.
    if (proxyGuardOn && path !== '/api/health' && !isSignedByProxy(req)) {
      if (config.siteUrl && (req.method === 'GET' || req.method === 'HEAD')) {
        res.writeHead(301, { Location: config.siteUrl + (req.url ?? '/'), 'Cache-Control': 'no-store' });
        return void res.end();
      }
      throw new HttpError(403, 'Use the public address of this site');
    }
    ctx.user = userFromRequest(ctx);
    if (path.startsWith('/api/')) {
      res.setHeader('X-Robots-Tag', 'noindex');
      if (!(await router.handle(ctx))) throw new HttpError(404, 'Not found');
    } else if (path.startsWith('/uploads/')) {
      await serveUpload(ctx, path.slice('/uploads/'.length));
    } else if (!(await serveSite(ctx))) {
      throw new HttpError(404, 'Not found');
    }
  } catch (err) {
    if (res.headersSent) return void res.end();
    if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message });
    if (err instanceof URIError) return sendJson(res, 400, { error: 'Bad URL' });
    console.error(err);
    sendJson(res, 500, { error: 'Something went wrong on the server' });
  }
});

// Drop clients that are too slow to send their request (slowloris-style).
server.headersTimeout = 15_000;
server.requestTimeout = 60_000;

server.listen(config.port, () => {
  console.log(`UIComponents API on http://localhost:${config.port}  (data: ${config.dataDir})`);
  if (proxyGuardOn) console.log(`  Netlify proxy guard on: direct visits redirect to ${config.siteUrl || '(set SITE_URL!)'}`);
  if (config.production && !config.siteUrl) {
    console.warn('  ⚠ Set SITE_URL (e.g. https://your-domain.com) so SEO links use your real address.');
  }
});

/**
 * First deploy on a host without a shell: if there is no admin yet and
 * ADMIN_EMAIL + ADMIN_PASSWORD are set, create that admin once. Delete the
 * ADMIN_PASSWORD variable on the host afterwards; it is never used again.
 */
function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';
  const users = (db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
  if (users > 0) {
    if (password) console.warn('  ⚠ ADMIN_PASSWORD is still set on the host. An admin exists, so remove it.');
    return;
  }
  if (!email || !password) {
    if (config.production) console.warn('  ⚠ No admin yet. Set ADMIN_EMAIL and ADMIN_PASSWORD once, or run npm run admin:create.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10) {
    console.error('  ✗ ADMIN_EMAIL must be an email and ADMIN_PASSWORD at least 10 characters. No admin created.');
    return;
  }
  db.prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)').run(email, hashPassword(password), now());
  console.log(`  ✓ Admin created from environment: ${email}. Now remove ADMIN_PASSWORD from the host.`);
}
bootstrapAdmin();

purgeExpiredSessions();
setInterval(purgeExpiredSessions, 60 * 60 * 1000).unref();
setInterval(() => sweepLoginAttempts(), 5 * 60 * 1000).unref();
