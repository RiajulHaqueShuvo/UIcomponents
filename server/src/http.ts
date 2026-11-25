import type { IncomingMessage, ServerResponse } from 'node:http';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface User {
  id: number;
  email: string;
}

export interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params: Record<string, string>;
  user: User | null;
}

/** A handler that returns a value sends it as JSON; returning undefined passes to the next handler. */
export type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

interface Route {
  method: string;
  regex: RegExp;
  keys: string[];
  handlers: Handler[];
}

export class Router {
  private routes: Route[] = [];

  add(method: string, path: string, ...handlers: Handler[]): this {
    const keys: string[] = [];
    const pattern = path.replace(/\/:(\w+)/g, (_, key: string) => {
      keys.push(key);
      return '/([^/]+)';
    });
    this.routes.push({ method, regex: new RegExp(`^${pattern}/?$`), keys, handlers });
    return this;
  }

  get(path: string, ...h: Handler[]) { return this.add('GET', path, ...h); }
  post(path: string, ...h: Handler[]) { return this.add('POST', path, ...h); }
  put(path: string, ...h: Handler[]) { return this.add('PUT', path, ...h); }
  delete(path: string, ...h: Handler[]) { return this.add('DELETE', path, ...h); }

  /** Returns false when no route matches the path. */
  async handle(ctx: Ctx): Promise<boolean> {
    let pathMatched = false;
    for (const route of this.routes) {
      const m = route.regex.exec(ctx.url.pathname);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== ctx.req.method) continue;

      try {
        ctx.params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      } catch {
        throw new HttpError(400, 'Bad URL'); // e.g. a stray "%" in the path
      }
      for (const handler of route.handlers) {
        const result = await handler(ctx);
        if (ctx.res.headersSent) return true;
        if (result !== undefined) {
          sendJson(ctx.res, 200, result);
          return true;
        }
      }
      sendJson(ctx.res, 204, null);
      return true;
    }
    if (pathMatched) throw new HttpError(405, 'Method not allowed');
    return false;
  }
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (status === 204) {
    res.writeHead(204).end();
    return;
  }
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

export function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length'] ?? 0);
    if (declared > limit) return reject(new HttpError(413, 'Request is too large'));
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, 'Request is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export async function readJson(req: IncomingMessage, limit: number): Promise<Record<string, unknown>> {
  if (!String(req.headers['content-type'] ?? '').includes('application/json')) {
    throw new HttpError(415, 'Send JSON (Content-Type: application/json)');
  }
  const raw = (await readBody(req, limit)).toString('utf8');
  try {
    const value: unknown = JSON.parse(raw || '{}');
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function setCookie(
  res: ServerResponse,
  name: string,
  value: string,
  opts: { maxAge: number; secure: boolean }
) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${opts.maxAge}`,
  ];
  if (opts.secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

/** The caller's IP. Proxy headers are used only when trustProxy is on (they're easy to fake). */
export const clientIp = (req: IncomingMessage, trustedHops: number) => {
  if (trustedHops > 0) {
    const chain = String(req.headers['x-forwarded-for'] ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const ip = chain[chain.length - trustedHops];
    if (ip) return ip;
  }
  return req.socket.remoteAddress ?? 'unknown';
};
