import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { requireAdmin } from '../auth.ts';
import { config, uploadsDir } from '../config.ts';
import { db, now } from '../db.ts';
import { HttpError, readBody, type Ctx, type Router } from '../http.ts';
import * as v from '../validate.ts';

/** Allowed upload types → file extension used on disk. */
const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'text/markdown': 'md',
  'text/plain': 'txt',
  'font/woff2': 'woff2',
  'font/woff': 'woff',
  'video/mp4': 'mp4',
};
const MIME_BY_EXT = Object.fromEntries(Object.entries(TYPES).map(([m, e]) => [e, m]));
const STORED_NAME = /^[0-9a-f-]{36}\.[a-z0-9]+$/;

interface Row {
  id: number;
  filename: string;
  stored_name: string;
  mime: string;
  size: number;
  created_at: string;
}

const toApi = (r: Row) => ({
  id: r.id,
  filename: r.filename,
  url: `/uploads/${r.stored_name}`,
  mime: r.mime,
  size: r.size,
  createdAt: r.created_at,
});

export function mediaRoutes(r: Router) {
  r.get('/api/admin/media', requireAdmin, () =>
    (db.prepare('SELECT * FROM media ORDER BY id DESC').all() as unknown as Row[]).map(toApi)
  );

  // Raw upload: body = file bytes, Content-Type = file type, ?name=original-name.png
  r.post('/api/admin/media', requireAdmin, async (ctx) => {
    const mime = String(ctx.req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    const ext = TYPES[mime];
    if (!ext) throw new HttpError(415, `This file type (${mime || 'unknown'}) isn't allowed`);
    const filename = v.text(ctx.url.searchParams.get('name') ?? '', 'File name', 200).replace(/[\\/]/g, '_');
    const data = await readBody(ctx.req, config.maxUploadBytes);
    if (data.length === 0) throw new HttpError(400, 'The file is empty');

    const stored = `${randomUUID()}.${ext}`;
    await writeFile(join(uploadsDir, stored), data);
    const res = db
      .prepare('INSERT INTO media (filename, stored_name, mime, size, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(filename, stored, mime, data.length, now());
    return toApi(db.prepare('SELECT * FROM media WHERE id = ?').get(Number(res.lastInsertRowid)) as unknown as Row);
  });

  r.delete('/api/admin/media/:id', requireAdmin, async (ctx) => {
    const id = v.id(ctx.params.id);
    const row = db.prepare('SELECT * FROM media WHERE id = ?').get(id) as Row | undefined;
    if (!row) throw new HttpError(404, 'File not found');
    db.prepare('DELETE FROM media WHERE id = ?').run(id);
    await unlink(join(uploadsDir, row.stored_name)).catch(() => undefined);
    return { ok: true };
  });
}

/** GET /uploads/<stored-name> — public files. */
export async function serveUpload(ctx: Ctx, name: string) {
  if (!STORED_NAME.test(name)) throw new HttpError(404, 'Not found');
  const path = join(uploadsDir, name);
  const info = await stat(path).catch(() => null);
  if (!info) throw new HttpError(404, 'Not found');
  const ext = name.split('.').pop()!;
  const headers: Record<string, string | number> = {
    'Content-Type': MIME_BY_EXT[ext] ?? 'application/octet-stream',
    'Content-Length': info.size,
    // Names are unique per upload, so files never change.
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
  // Files opened directly (SVG, PDF, Markdown…) run sandboxed with no scripts,
  // so an uploaded file can never act as a page on our origin.
  headers['Content-Security-Policy'] = "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox";
  ctx.res.writeHead(200, headers);
  createReadStream(path).pipe(ctx.res);
}
