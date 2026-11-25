import { api, type ServerComponent } from '../data/api';
import type { SiteSettings } from '../data/siteDefaults';

export interface AdminUser {
  id: number;
  email: string;
}

export type ComponentSummary = Omit<ServerComponent, 'react' | 'html'> & { hasReact: boolean; hasHtml: boolean };

export interface ComponentInput {
  name: string;
  slug: string;
  category: string;
  description: string;
  status: 'draft' | 'published';
  isNew: boolean;
  stage: 'center' | 'fill';
  reactTsx: string;
  reactCss: string;
  html: string;
  htmlCss: string;
  htmlJs: string;
  usage: string;
  props: unknown[] | null;
  controls: unknown[] | null;
}

export interface Revision {
  id: number;
  author: string;
  createdAt: string;
}

export interface Doc {
  id: number;
  slug: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
  sort: number;
  createdAt: string;
  updatedAt: string;
}
export type DocSummary = Omit<Doc, 'body'> & { words: number };
export type DocInput = Pick<Doc, 'slug' | 'title' | 'body' | 'status' | 'sort'>;

export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  mime: string;
  size: number;
  createdAt: string;
}

export interface Stats {
  components: number;
  published: number;
  drafts: number;
  compileErrors: number;
  documents: number;
  media: number;
  recent: { kind: 'component' | 'document'; id: number; title: string; status: string; updatedAt: string }[];
}

export const adminApi = {
  me: () => api<{ user: AdminUser }>('GET', '/api/auth/me'),
  login: (email: string, password: string) => api<{ user: AdminUser }>('POST', '/api/auth/login', { email, password }),
  logout: () => api('POST', '/api/auth/logout'),
  stats: () => api<Stats>('GET', '/api/admin/stats'),

  components: () => api<ComponentSummary[]>('GET', '/api/admin/components'),
  component: (id: number) => api<ServerComponent>('GET', `/api/admin/components/${id}`),
  createComponent: (c: ComponentInput) => api<ServerComponent>('POST', '/api/admin/components', c),
  updateComponent: (id: number, c: ComponentInput) => api<ServerComponent>('PUT', `/api/admin/components/${id}`, c),
  deleteComponent: (id: number) => api('DELETE', `/api/admin/components/${id}`),
  revisions: (id: number) => api<Revision[]>('GET', `/api/admin/components/${id}/revisions`),
  restoreRevision: (id: number, rid: number) =>
    api<ServerComponent>('POST', `/api/admin/components/${id}/revisions/${rid}/restore`, {}),
  compile: (tsx: string, css: string, stage: string) =>
    api<{ ok: boolean; html?: string; error?: string }>('POST', '/api/admin/compile', { tsx, css, stage }),

  documents: () => api<DocSummary[]>('GET', '/api/admin/documents'),
  document: (id: number) => api<Doc>('GET', `/api/admin/documents/${id}`),
  createDocument: (d: DocInput) => api<Doc>('POST', '/api/admin/documents', d),
  updateDocument: (id: number, d: DocInput) => api<Doc>('PUT', `/api/admin/documents/${id}`, d),
  deleteDocument: (id: number) => api('DELETE', `/api/admin/documents/${id}`),

  media: () => api<MediaItem[]>('GET', '/api/admin/media'),
  upload: (file: File) =>
    api<MediaItem>('POST', `/api/admin/media?name=${encodeURIComponent(file.name)}`, file, {
      headers: { 'Content-Type': file.type || guessType(file.name) },
    }),
  deleteMedia: (id: number) => api('DELETE', `/api/admin/media/${id}`),

  settings: () => api<SiteSettings>('GET', '/api/admin/settings'),
  saveSettings: (s: SiteSettings) => api<SiteSettings>('PUT', '/api/admin/settings', s),
};

/** Browsers leave file.type empty for some files (e.g. .md); guess from the name. */
function guessType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  return ({ md: 'text/markdown', txt: 'text/plain', woff2: 'font/woff2', woff: 'font/woff', svg: 'image/svg+xml' } as Record<string, string>)[ext ?? ''] ?? 'application/octet-stream';
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
