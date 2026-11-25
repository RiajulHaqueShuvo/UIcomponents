import { requireAdmin } from '../auth.ts';
import { db } from '../db.ts';
import { readJson, type Router } from '../http.ts';
import { getSettings, saveSettings, validateSettings } from '../settings.ts';
import { publishedComponents } from './components.ts';
import { publishedDocuments } from './documents.ts';

const count = (sql: string) => (db.prepare(sql).get() as { n: number }).n;

export function siteRoutes(r: Router) {
  /** For the host's health check: the server is up and the database answers. */
  r.get('/api/health', () => ({ ok: count('SELECT COUNT(*) AS n FROM users') >= 0 }));

  /** Everything the public site needs, in one request. */
  r.get('/api/public/site', () => ({
    settings: getSettings(),
    components: publishedComponents().map(({ compileError: _e, ...c }) => c),
    documents: publishedDocuments(),
  }));

  r.get('/api/admin/settings', requireAdmin, () => getSettings());

  r.put('/api/admin/settings', requireAdmin, async (ctx) => {
    const s = validateSettings(await readJson(ctx.req, 100_000));
    saveSettings(s);
    return s;
  });

  r.get('/api/admin/stats', requireAdmin, () => ({
    components: count('SELECT COUNT(*) AS n FROM components'),
    published: count("SELECT COUNT(*) AS n FROM components WHERE status = 'published'"),
    drafts: count("SELECT COUNT(*) AS n FROM components WHERE status = 'draft'"),
    compileErrors: count('SELECT COUNT(*) AS n FROM components WHERE compile_error IS NOT NULL'),
    documents: count('SELECT COUNT(*) AS n FROM documents'),
    media: count('SELECT COUNT(*) AS n FROM media'),
    recent: db
      .prepare(
        `SELECT 'component' AS kind, id, name AS title, status, updated_at AS updatedAt FROM components
         UNION ALL
         SELECT 'document', id, title, status, updated_at FROM documents
         ORDER BY updatedAt DESC LIMIT 8`
      )
      .all(),
  }));
}
