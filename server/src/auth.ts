import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { config } from './config.ts';
import { db } from './db.ts';
import { HttpError, parseCookies, setCookie, type Ctx, type User } from './http.ts';

/*
 * On HTTPS the cookie uses the __Host- prefix: browsers then refuse it unless
 * it is Secure, has Path=/ and no Domain, so subdomains can't overwrite it.
 */
export const SESSION_COOKIE = config.cookieSecure ? '__Host-uic_session' : 'uic_session';

/* ---------- Passwords (scrypt) ---------- */

const N = 16384;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N, r: 8, p: 1 });
  return `scrypt$${N}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, n, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length, { N: Number(n), r: 8, p: 1 });
  return timingSafeEqual(actual, expected);
}

/* ---------- Sessions ---------- */
// The cookie holds a random token; the database only stores its SHA-256 hash,
// so a leaked database can't be used to log in.

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function createSession(ctx: Ctx, userId: number) {
  const token = randomBytes(32).toString('base64url');
  const maxAge = config.sessionDays * 24 * 60 * 60;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    sha256(token),
    userId,
    Date.now() + maxAge * 1000
  );
  setCookie(ctx.res, SESSION_COOKIE, token, { maxAge, secure: config.cookieSecure });
}

export function destroySession(ctx: Ctx) {
  const token = parseCookies(ctx.req.headers.cookie)[SESSION_COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
  setCookie(ctx.res, SESSION_COOKIE, '', { maxAge: 0, secure: config.cookieSecure });
}

export function userFromRequest(ctx: Ctx): User | null {
  const token = parseCookies(ctx.req.headers.cookie)[SESSION_COOKIE];
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .get(sha256(token), Date.now()) as { id: number; email: string } | undefined;
  return row ? { id: row.id, email: row.email } : null;
}

export function purgeExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
}

/* ---------- Guards ---------- */

/**
 * Admin-only. Writes must also carry the X-UIC-Admin header: browsers can't add
 * custom headers to cross-site requests without CORS (which we don't allow),
 * so together with SameSite=Strict cookies this blocks CSRF.
 */
export const requireAdmin = (ctx: Ctx) => {
  if (!ctx.user) throw new HttpError(401, 'Please log in');
  if (ctx.req.method !== 'GET' && ctx.req.headers['x-uic-admin'] !== '1') {
    throw new HttpError(403, 'Missing admin request header');
  }
  return undefined;
};

/* ---------- Login rate limits (in memory) ---------- */
// Two limits: per IP (one attacker) and per account (one account attacked
// from many IPs). Old entries are swept, and the table is capped so floods of
// fake keys can't eat memory.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_KEYS = 10_000;
const LIMITS = { ip: 8, account: 20 };
const attempts = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, max: number) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    if (attempts.size >= MAX_KEYS) sweepLoginAttempts(true);
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
  if (entry.count > max) {
    const minutes = Math.ceil((entry.resetAt - now) / 60000);
    throw new HttpError(429, `Too many login attempts. Try again in ${minutes} min.`);
  }
}

export function checkLoginRate(ip: string, email: string) {
  hit(`ip:${ip}`, LIMITS.ip);
  hit(`acct:${email.toLowerCase()}`, LIMITS.account);
}

export function clearLoginRate(ip: string, email: string) {
  attempts.delete(`ip:${ip}`);
  attempts.delete(`acct:${email.toLowerCase()}`);
}

/** Drop expired entries; if still full (a flood), drop the oldest half. */
export function sweepLoginAttempts(force = false) {
  const now = Date.now();
  for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
  if (force && attempts.size >= MAX_KEYS) {
    let n = 0;
    for (const k of attempts.keys()) {
      if (n++ >= MAX_KEYS / 2) break;
      attempts.delete(k);
    }
  }
}
