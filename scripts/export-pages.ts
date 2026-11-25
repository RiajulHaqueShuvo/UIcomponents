/*
 * Static export for GitHub Pages (run by `npm run build:pages`, after vite build).
 *
 * GitHub Pages can't run our server, so this writes the pages the server would
 * send, as files: one HTML file per page with its own title, description,
 * canonical, social tags, JSON-LD and readable content, plus sitemap.xml and
 * a 404.html that still boots the app.
 *
 * Needs SITE_URL (e.g. https://user.github.io/UIcomponents) and BASE_PATH
 * (e.g. /UIcomponents/). Uses a throwaway, empty database: only the built-in
 * library is exported.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

if (!process.env.SITE_URL || !process.env.BASE_PATH) {
  console.error('  ✗ Set SITE_URL and BASE_PATH (npm run build:pages does this).');
  process.exit(1);
}
const dataDir = mkdtempSync(join(tmpdir(), 'uic-export-'));
process.env.DATA_DIR = dataDir;

const { config } = await import('../server/src/config.ts');
const { renderPage, sitemap } = await import('../server/src/seo.ts');
const { db } = await import('../server/src/db.ts');

const req = { headers: {} } as IncomingMessage;
const dist = config.distDir;

// Every page in the sitemap, read back from it so the two never disagree.
const xml = await sitemap(req);
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.slice(config.basePath.length) || '/');

/** /components/x → components/x.html (GitHub Pages serves it at /components/x, no redirect). */
const fileFor = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

for (const path of paths) {
  const page = await renderPage(req, path);
  if (!page || page.status !== 200) throw new Error(`Export failed for ${path}`);
  const file = join(dist, fileFor(path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page.html);
}

const notFound = await renderPage(req, '/__not-found__');
await writeFile(join(dist, '404.html'), notFound!.html);
await writeFile(join(dist, 'sitemap.xml'), xml);
// Jekyll would hide files starting with "_"; we publish plain files.
await writeFile(join(dist, '.nojekyll'), '');

db.close();
rmSync(dataDir, { recursive: true, force: true });
console.log(`  ✓ Exported ${paths.length} pages + 404.html + sitemap.xml to dist/`);
// Sanity check: the template still has the built assets under the base path.
const home = await readFile(join(dist, 'index.html'), 'utf8');
if (!home.includes(`${config.basePath}/assets/`)) throw new Error('Assets are not under BASE_PATH');
