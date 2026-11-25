import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The uicomponents/ project folder. */
export const ROOT = resolve(here, '..', '..');

const production = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT ?? 5621),
  production,
  /** Database and uploads live here. Point it at a persistent disk when deploying. */
  dataDir: resolve(process.env.DATA_DIR ?? join(ROOT, 'server', 'data')),
  /** Secure cookies need HTTPS: on in production, off for http://localhost. */
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === '1' : production,
  /**
   * How many reverse proxies we control sit in front of the app (TRUST_PROXY=1
   * on Render/Railway/one Nginx). 0 = ignore X-Forwarded-For, which anyone can
   * fake. Each proxy appends the address it saw, so we read the entry that our
   * outermost trusted proxy added (counting from the right), never the
   * client-written leftmost one.
   */
  trustProxy: Math.max(0, Math.min(5, Number.parseInt(process.env.TRUST_PROXY ?? '0', 10) || 0)),
  /** Public address, e.g. https://uicomponents.com. Used for SEO links; falls back to the request's host. */
  siteUrl: (process.env.SITE_URL ?? '').replace(/\/+$/, ''),
  /** Path prefix for static hosting (GitHub Pages: /UIcomponents). Empty on our own server. */
  basePath: (process.env.BASE_PATH ?? '').replace(/\/+$/, ''),
  distDir: join(ROOT, 'dist'),
  sessionDays: 7,
  maxJsonBytes: 2 * 1024 * 1024,
  maxUploadBytes: 15 * 1024 * 1024,
};

export const uploadsDir = join(config.dataDir, 'uploads');
