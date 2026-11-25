import { requireAdmin } from '../auth.ts';
import { config } from '../config.ts';
import { db, now } from '../db.ts';
import { HttpError, readJson, type Router } from '../http.ts';
import * as v from '../validate.ts';

interface Row {
  id: number;
  slug: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
  sort: number;
  created_at: string;
  updated_at: string;
}

const toApi = (r: Row) => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  body: r.body,
  status: r.status,
  sort: r.sort,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const getRow = (id: number) => {
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as Row | undefined;
  if (!row) throw new HttpError(404, 'Document not found');
  return row;
};

function parseInput(body: Record<string, unknown>) {
  const sort = Number(body.sort ?? 0);
  return {
    slug: v.slug(body.slug),
    title: v.text(body.title, 'Title', 120),
    body: v.optionalText(body.body, 'Content', 500_000),
    status: v.oneOf(body.status ?? 'draft', 'Status', ['draft', 'published'] as const),
    sort: Number.isInteger(sort) ? sort : 0,
  };
}

function assertSlugFree(slug: string, exceptId = 0) {
  if (db.prepare('SELECT id FROM documents WHERE slug = ? AND id != ?').get(slug, exceptId)) {
    throw new HttpError(409, `The slug "${slug}" is already used by another document`);
  }
}

export function documentRoutes(r: Router) {
  r.get('/api/admin/documents', requireAdmin, () =>
    (db.prepare('SELECT * FROM documents ORDER BY sort, title').all() as unknown as Row[]).map((d) => {
      const { body, ...rest } = toApi(d);
      return { ...rest, words: body.split(/\s+/).filter(Boolean).length };
    })
  );

  r.get('/api/admin/documents/:id', requireAdmin, (ctx) => toApi(getRow(v.id(ctx.params.id))));

  r.post('/api/admin/documents', requireAdmin, async (ctx) => {
    const d = parseInput(await readJson(ctx.req, config.maxJsonBytes));
    assertSlugFree(d.slug);
    const t = now();
    const res = db
      .prepare('INSERT INTO documents (slug, title, body, status, sort, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(d.slug, d.title, d.body, d.status, d.sort, t, t);
    return toApi(getRow(Number(res.lastInsertRowid)));
  });

  r.put('/api/admin/documents/:id', requireAdmin, async (ctx) => {
    const id = v.id(ctx.params.id);
    getRow(id);
    const d = parseInput(await readJson(ctx.req, config.maxJsonBytes));
    assertSlugFree(d.slug, id);
    db.prepare('UPDATE documents SET slug = ?, title = ?, body = ?, status = ?, sort = ?, updated_at = ? WHERE id = ?').run(
      d.slug, d.title, d.body, d.status, d.sort, now(), id
    );
    return toApi(getRow(id));
  });

  r.delete('/api/admin/documents/:id', requireAdmin, (ctx) => {
    const id = v.id(ctx.params.id);
    getRow(id);
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    return { ok: true };
  });

  r.get('/api/public/documents/:slug', (ctx) => {
    const row = db.prepare("SELECT * FROM documents WHERE slug = ? AND status = 'published'").get(ctx.params.slug) as
      | Row
      | undefined;
    if (!row) throw new HttpError(404, 'Document not found');
    return { slug: row.slug, title: row.title, body: row.body, updatedAt: row.updated_at };
  });
}

export const publishedDocuments = () =>
  db.prepare("SELECT slug, title FROM documents WHERE status = 'published' ORDER BY sort, title").all();
