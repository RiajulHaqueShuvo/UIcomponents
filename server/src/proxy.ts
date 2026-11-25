/*
 * Netlify in front of the server (free *.netlify.app address).
 *
 * Netlify forwards every request to this server and signs it: the
 * `X-Nf-Sign` header is a JWT (HS256) made with a secret only Netlify and
 * this server know (PROXY_SIGNATURE_SECRET here, the same value in Netlify's
 * UIC_PROXY_SECRET variable, see netlify.toml).
 *
 * With the secret set:
 *  - signed requests are trusted, and the visitor IP comes from Netlify's
 *    `X-Nf-Client-Connection-Ip` header;
 *  - unsigned requests (someone opening the onrender.com address directly)
 *    are redirected to SITE_URL, so nobody can skip Netlify to dodge the
 *    login limit, and Google sees only one address. The host's health check
 *    is the only exception.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const SECRET = process.env.PROXY_SIGNATURE_SECRET ?? '';

export const proxyGuardOn = SECRET.length >= 16;

const b64url = (buf: Buffer) => buf.toString('base64url');

/** True when the request carries a valid, unexpired Netlify signature. */
export function isSignedByProxy(req: IncomingMessage): boolean {
  if (!proxyGuardOn) return false;
  const token = String(req.headers['x-nf-sign'] ?? '');
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [head, body, sig] = parts;
  try {
    const header = JSON.parse(Buffer.from(head, 'base64url').toString('utf8')) as { alg?: string };
    if (header.alg !== 'HS256') return false;
    const expected = createHmac('sha256', SECRET).update(`${head}.${body}`).digest();
    const given = Buffer.from(sig, 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as { iss?: string; exp?: number };
    if (claims.iss !== undefined && claims.iss !== 'netlify') return false;
    if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/** Visitor IP as reported by Netlify (only call for signed requests). */
export function proxyClientIp(req: IncomingMessage): string | null {
  const ip = String(req.headers['x-nf-client-connection-ip'] ?? '').trim();
  return /^[0-9a-fA-F:.]{2,45}$/.test(ip) ? ip : null;
}

/** For tests: make a token the way Netlify does. */
export function signForTest(secret: string, claims: Record<string, unknown>): string {
  const head = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(Buffer.from(JSON.stringify(claims)));
  const sig = b64url(createHmac('sha256', secret).update(`${head}.${body}`).digest());
  return `${head}.${body}.${sig}`;
}
