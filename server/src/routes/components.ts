import { requireAdmin } from '../auth.ts';
import { compileReact, reactPreviewPage } from '../compile.ts';
import { config } from '../config.ts';
import { db, now, transaction } from '../db.ts';
import { HttpError, readJson, type Ctx, type Router } from '../http.ts';
import * as v from '../validate.ts';

interface Row {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  status: 'draft' | 'published';
  is_new: number;
  stage: 'center' | 'fill';
  react_tsx: string | null;
  react_css: string | null;
  html: string | null;
  html_css: string | null;
  html_js: string | null;
  usage: string | null;
  props: string | null;
  controls: string | null;
  react_bundle: string | null;
  compile_error: string | null;
  created_at: string;
  updated_at: string;
}

/** Row → API shape (camelCase, parsed JSON). The compiled bundle is never sent. */
export function toApi(r: Row) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    description: r.description,
    status: r.status,
    isNew: r.is_new === 1,
    stage: r.stage,
    react: r.react_tsx ? { tsx: r.react_tsx, css: r.react_css } : null,
    html: r.html ? { html: r.html, css: r.html_css, js: r.html_js } : null,
    usage: r.usage,
    props: r.props ? JSON.parse(r.props) : null,
    controls: r.controls ? JSON.parse(r.controls) : null,
    compiled: Boolean(r.react_bundle),
    compileError: r.compile_error,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const getRow = (id: number) => {
  const row = db.prepare('SELECT * FROM components WHERE id = ?').get(id) as Row | undefined;
  if (!row) throw new HttpError(404, 'Component not found');
  return row;
};

/** Validates the editor form. */
function parseInput(body: Record<string, unknown>) {
  const input = {
    slug: v.slug(body.slug),
    name: v.text(body.name, 'Name', 80),
    category: v.oneOf(body.category, 'Category', v.CATEGORY_IDS),
    description: v.optionalText(body.description, 'Description', 400).trim(),
    status: v.oneOf(body.status ?? 'draft', 'Status', ['draft', 'published'] as const),
    is_new: v.bool(body.isNew) ? 1 : 0,
    stage: v.oneOf(body.stage ?? 'center', 'Stage', ['center', 'fill'] as const),
    react_tsx: v.code(body.reactTsx, 'React code'),
    react_css: v.code(body.reactCss, 'React CSS'),
    html: v.code(body.html, 'HTML'),
    html_css: v.code(body.htmlCss, 'HTML CSS'),
    html_js: v.code(body.htmlJs, 'HTML JavaScript'),
    usage: v.code(body.usage, 'Usage', 5000),
    props: v.jsonArray(body.props, 'Props'),
    controls: v.jsonArray(body.controls, 'Controls'),
  };
  if (!input.react_tsx && !input.html) {
    throw new HttpError(400, 'Add React code or HTML (at least one version).');
  }
  return input;
}

async function compileFields(tsx: string | null) {
  if (!tsx) return { react_bundle: null, compile_error: null };
  const { bundle, error } = await compileReact(tsx);
  return { react_bundle: bundle, compile_error: error };
}

function assertSlugFree(slug: string, exceptId = 0) {
  const taken = db.prepare('SELECT id FROM components WHERE slug = ? AND id != ?').get(slug, exceptId);
  if (taken) throw new HttpError(409, `The slug "${slug}" is already used by another component`);
}

/** Store a copy of a component (without its compiled bundle); keep the latest 30 per component. */
function saveRevision(row: Row, author: string) {
  const { react_bundle: _bundle, ...snapshot } = row;
  db.prepare('INSERT INTO component_revisions (component_id, snapshot, author, created_at) VALUES (?, ?, ?, ?)').run(
    row.id,
    JSON.stringify(snapshot),
    author,
    now()
  );
  db.prepare(
    `DELETE FROM component_revisions WHERE component_id = ? AND id NOT IN
     (SELECT id FROM component_revisions WHERE component_id = ? ORDER BY id DESC LIMIT 30)`
  ).run(row.id, row.id);
}

const COLUMNS = [
  'slug', 'name', 'category', 'description', 'status', 'is_new', 'stage',
  'react_tsx', 'react_css', 'html', 'html_css', 'html_js', 'usage', 'props', 'controls',
  'react_bundle', 'compile_error',
] as const;

export function componentRoutes(r: Router) {
  r.get('/api/admin/components', requireAdmin, () => {
    const rows = db.prepare('SELECT * FROM components ORDER BY updated_at DESC').all() as unknown as Row[];
    return rows.map((row) => {
      const { react, html, ...rest } = toApi(row);
      return { ...rest, hasReact: Boolean(react), hasHtml: Boolean(html) };
    });
  });

  r.get('/api/admin/components/:id', requireAdmin, (ctx) => toApi(getRow(v.id(ctx.params.id))));

  r.post('/api/admin/components', requireAdmin, async (ctx) => {
    const input = parseInput(await readJson(ctx.req, config.maxJsonBytes));
    assertSlugFree(input.slug);
    const compiled = await compileFields(input.react_tsx);
    const values = { ...input, ...compiled };
    const t = now();
    const res = db
      .prepare(
        `INSERT INTO components (${COLUMNS.join(', ')}, created_at, updated_at)
         VALUES (${COLUMNS.map(() => '?').join(', ')}, ?, ?)`
      )
      .run(...COLUMNS.map((c) => values[c]), t, t);
    return toApi(getRow(Number(res.lastInsertRowid)));
  });

  r.put('/api/admin/components/:id', requireAdmin, async (ctx) => {
    const id = v.id(ctx.params.id);
    const before = getRow(id);
    const input = parseInput(await readJson(ctx.req, config.maxJsonBytes));
    assertSlugFree(input.slug, id);
    // Only recompile when the React code changed.
    const compiled =
      input.react_tsx === before.react_tsx
        ? { react_bundle: before.react_bundle, compile_error: before.compile_error }
        : await compileFields(input.react_tsx);
    const values = { ...input, ...compiled };

    transaction(() => {
      saveRevision(before, ctx.user!.email);
      db.prepare(
        `UPDATE components SET ${COLUMNS.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ?`
      ).run(...COLUMNS.map((c) => values[c]), now(), id);
    });
    return toApi(getRow(id));
  });

  r.delete('/api/admin/components/:id', requireAdmin, (ctx) => {
    const id = v.id(ctx.params.id);
    getRow(id);
    db.prepare('DELETE FROM components WHERE id = ?').run(id);
    return { ok: true };
  });

  r.get('/api/admin/components/:id/revisions', requireAdmin, (ctx) => {
    const id = v.id(ctx.params.id);
    return db
      .prepare('SELECT id, author, created_at AS createdAt FROM component_revisions WHERE component_id = ? ORDER BY id DESC')
      .all(id);
  });

  r.post('/api/admin/components/:id/revisions/:rid/restore', requireAdmin, async (ctx) => {
    const id = v.id(ctx.params.id);
    const rev = db
      .prepare('SELECT snapshot FROM component_revisions WHERE id = ? AND component_id = ?')
      .get(v.id(ctx.params.rid), id) as { snapshot: string } | undefined;
    if (!rev) throw new HttpError(404, 'Revision not found');
    const snap = JSON.parse(rev.snapshot) as Row;
    assertSlugFree(snap.slug, id);
    const current = getRow(id);
    const compiled = await compileFields(snap.react_tsx);
    const values = { ...snap, ...compiled } as Record<string, unknown>;
    transaction(() => {
      // The version being replaced goes into history too, so a restore can be undone.
      saveRevision(current, ctx.user!.email);
      db.prepare(`UPDATE components SET ${COLUMNS.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ?`).run(
        ...COLUMNS.map((c) => values[c] as string | number | null),
        now(),
        id
      );
    });
    return toApi(getRow(id));
  });

  // Live preview while editing (nothing is saved).
  r.post('/api/admin/compile', requireAdmin, async (ctx) => {
    const body = await readJson(ctx.req, config.maxJsonBytes);
    const tsx = v.code(body.tsx, 'React code');
    if (!tsx) throw new HttpError(400, 'No React code to preview');
    const stage = body.stage === 'fill' ? 'fill' : 'center';
    const { bundle, error } = await compileReact(tsx);
    if (!bundle) return { ok: false, error };
    return { ok: true, html: reactPreviewPage(bundle, v.code(body.css, 'CSS'), stage) };
  });

  // Public preview page for a published React component (admins can also preview drafts).
  r.get('/api/public/preview/:slug', (ctx: Ctx) => {
    const row = db.prepare('SELECT * FROM components WHERE slug = ?').get(ctx.params.slug) as Row | undefined;
    if (!row || (row.status !== 'published' && !ctx.user) || !row.react_bundle) {
      throw new HttpError(404, 'Preview not found');
    }
    const page = reactPreviewPage(row.react_bundle, row.react_css, row.stage);
    ctx.res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      // Even if opened directly, the page runs sandboxed (no access to our origin).
      // (No frame-ancestors: a sandboxed page has an opaque origin, so 'self' would
      // block our own site from embedding it.)
      'Content-Security-Policy': 'sandbox allow-scripts',
      'Cache-Control': 'no-cache',
    });
    ctx.res.end(page);
    return undefined;
  });
}

export const publishedComponents = () =>
  (db.prepare("SELECT * FROM components WHERE status = 'published' ORDER BY name").all() as unknown as Row[]).map(toApi);
