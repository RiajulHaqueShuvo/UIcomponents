import type { PropDoc, Control } from '../registry/types';
import type { SiteSettings } from './siteDefaults';

/** A component as the server sends it. */
export interface ServerComponent {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  status: 'draft' | 'published';
  isNew: boolean;
  stage: 'center' | 'fill';
  react: { tsx: string; css: string | null } | null;
  html: { html: string; css: string | null; js: string | null } | null;
  usage: string | null;
  props: PropDoc[] | null;
  controls: Control[] | null;
  compiled: boolean;
  compileError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSite {
  settings: SiteSettings;
  components: ServerComponent[];
  documents: { slug: string; title: string }[];
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * JSON request to our API. Admin writes add the X-UIC-Admin header the
 * server requires (CSRF protection). Cookies are sent automatically.
 */
export async function api<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  init: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = { 'X-UIC-Admin': '1', ...(init.headers as Record<string, string>) };
  let payload: BodyInit | undefined;
  if (body instanceof Blob) payload = body;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res: Response;
  try {
    res = await fetch(path, { ...init, method, headers, body: payload, credentials: 'same-origin' });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is it running? (npm run dev:all)");
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  return data as T;
}
