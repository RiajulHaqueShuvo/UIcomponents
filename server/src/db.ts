import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config, uploadsDir } from './config.ts';

mkdirSync(uploadsDir, { recursive: true });

export const db = new DatabaseSync(join(config.dataDir, 'app.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');

/*
 * Migrations run in order, once each. Never edit a migration that has
 * shipped; add a new one to the end instead.
 */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE components (
    id            INTEGER PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    category      TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_new        INTEGER NOT NULL DEFAULT 0,
    stage         TEXT NOT NULL DEFAULT 'center' CHECK (stage IN ('center', 'fill')),
    react_tsx     TEXT,
    react_css     TEXT,
    html          TEXT,
    html_css      TEXT,
    html_js       TEXT,
    usage         TEXT,
    props         TEXT,
    controls      TEXT,
    react_bundle  TEXT,
    compile_error TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
  );

  CREATE TABLE component_revisions (
    id           INTEGER PRIMARY KEY,
    component_id INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    snapshot     TEXT NOT NULL,
    author       TEXT NOT NULL,
    created_at   TEXT NOT NULL
  );
  CREATE INDEX component_revisions_by_component ON component_revisions(component_id, id DESC);

  CREATE TABLE documents (
    id         INTEGER PRIMARY KEY,
    slug       TEXT NOT NULL UNIQUE,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    sort       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE media (
    id          INTEGER PRIMARY KEY,
    filename    TEXT NOT NULL,
    stored_name TEXT NOT NULL UNIQUE,
    mime        TEXT NOT NULL,
    size        INTEGER NOT NULL,
    created_at  TEXT NOT NULL
  );
  `,
];

function migrate() {
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const row = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined;
  if (!row) db.prepare('INSERT INTO schema_version (version) VALUES (0)').run();
  let version = row?.version ?? 0;

  for (; version < MIGRATIONS.length; version++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[version]);
      db.prepare('UPDATE schema_version SET version = ?').run(version + 1);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}

migrate();

export const now = () => new Date().toISOString();

/** Run fn inside a transaction; rolls back if it throws. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
