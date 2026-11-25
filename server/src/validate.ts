import { HttpError } from './http.ts';

export const CATEGORY_IDS = ['text', 'animations', 'backgrounds', 'buttons', 'cards', 'ui'] as const;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const bad = (msg: string) => new HttpError(400, msg);

export function text(v: unknown, field: string, max = 200): string {
  if (typeof v !== 'string' || !v.trim()) throw bad(`${field} is required`);
  if (v.length > max) throw bad(`${field} must be at most ${max} characters`);
  return v.trim();
}

export function optionalText(v: unknown, field: string, max: number): string {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') throw bad(`${field} must be text`);
  if (v.length > max) throw bad(`${field} is too long (max ${max} characters)`);
  return v;
}

/** Code fields: empty string → null (no such file). */
export function code(v: unknown, field: string, max = 300_000): string | null {
  const s = optionalText(v, field, max);
  return s.trim() ? s : null;
}

export function slug(v: unknown, field = 'Slug'): string {
  const s = text(v, field, 80).toLowerCase();
  if (!SLUG.test(s)) throw bad(`${field} may only use a-z, 0-9 and single dashes (e.g. neon-card)`);
  return s;
}

export function oneOf<T extends string>(v: unknown, field: string, options: readonly T[]): T {
  if (typeof v !== 'string' || !options.includes(v as T)) {
    throw bad(`${field} must be one of: ${options.join(', ')}`);
  }
  return v as T;
}

export const bool = (v: unknown) => v === true || v === 1 || v === '1';

/** A JSON array (props/controls), stored as text. */
export function jsonArray(v: unknown, field: string): string | null {
  if (v === undefined || v === null || v === '') return null;
  if (!Array.isArray(v)) throw bad(`${field} must be a list`);
  const s = JSON.stringify(v);
  if (s.length > 50_000) throw bad(`${field} is too large`);
  return s;
}

export function id(v: string | undefined): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(404, 'Not found');
  return n;
}
