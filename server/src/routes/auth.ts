import { checkLoginRate, clearLoginRate, createSession, destroySession, verifyPassword } from '../auth.ts';
import { config } from '../config.ts';
import { db } from '../db.ts';
import { HttpError, clientIp, readJson, type Router } from '../http.ts';
import { isSignedByProxy, proxyClientIp } from '../proxy.ts';

// Compared against when the email doesn't exist, so response time doesn't reveal valid emails.
const DUMMY_HASH = 'scrypt$16384$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

export function authRoutes(r: Router) {
  r.post('/api/auth/login', async (ctx) => {
    const ip = (isSignedByProxy(ctx.req) && proxyClientIp(ctx.req)) || clientIp(ctx.req, config.trustProxy);
    const body = await readJson(ctx.req, 10_000);
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : '';
    const password = typeof body.password === 'string' ? body.password.slice(0, 1024) : '';
    checkLoginRate(ip, email);

    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email) as
      | { id: number; email: string; password_hash: string }
      | undefined;
    const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !ok) {
      console.warn(`[auth] failed login from ${ip}`);
      throw new HttpError(401, 'Wrong email or password');
    }

    clearLoginRate(ip, email);
    createSession(ctx, user.id);
    return { user: { id: user.id, email: user.email } };
  });

  r.post('/api/auth/logout', (ctx) => {
    destroySession(ctx);
    return { ok: true };
  });

  r.get('/api/auth/me', (ctx) => {
    if (!ctx.user) throw new HttpError(401, 'Not logged in');
    return { user: ctx.user, secureCookies: config.cookieSecure };
  });
}
