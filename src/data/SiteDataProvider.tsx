import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CATEGORIES, REGISTRY } from '../registry';
import { buildSrcdoc } from '../registry/srcdoc';
import type { Category, CategoryId, RegistryEntry, SourceFile, Variant } from '../registry/types';
import { api, type PublicSite, type ServerComponent } from './api';
import { SiteDataContext, type SiteData } from './context';
import { DEFAULT_SETTINGS } from './siteDefaults';
import { STATIC } from '../app/env';

const pascal = (slug: string) =>
  slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

/** Server component → the same shape the built-in library uses. */
export function fromServer(c: ServerComponent): RegistryEntry {
  const id = pascal(c.slug);
  const variants: Variant[] = [];
  if (c.react) {
    const files: SourceFile[] = [{ filename: `${id}.tsx`, language: 'tsx', code: c.react.tsx }];
    if (c.react.css) files.push({ filename: `${id}.css`, language: 'css', code: c.react.css });
    variants.push({ language: 'react', files });
  }
  if (c.html) {
    const files: SourceFile[] = [{ filename: 'index.html', language: 'html', code: c.html.html }];
    if (c.html.css) files.push({ filename: 'style.css', language: 'css', code: c.html.css });
    if (c.html.js) files.push({ filename: 'script.js', language: 'js', code: c.html.js });
    variants.push({ language: 'html', files });
  }
  return {
    id,
    source: 'server',
    slug: c.slug,
    name: c.name,
    description: c.description,
    category: c.category as CategoryId,
    isNew: c.isNew,
    stage: c.stage,
    usage: c.usage ?? undefined,
    props: c.props ?? undefined,
    controls: c.controls ?? undefined,
    variants,
    srcdoc: c.html ? buildSrcdoc(c.html.html, c.html.css ?? '', c.html.js ?? '') : undefined,
    previewUrl: c.react && c.compiled ? `/api/public/preview/${encodeURIComponent(c.slug)}` : undefined,
  };
}

export default function SiteDataProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<PublicSite | null>(null);
  // Static hosting (GitHub Pages) has no server: show the built-in library straight away.
  const [status, setStatus] = useState<SiteData['status']>(STATIC ? 'offline' : 'loading');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (STATIC) return;
    let cancelled = false;
    api<PublicSite>('GET', '/api/public/site')
      .then((data) => {
        if (cancelled) return;
        setRemote(data);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('offline'));
    return () => {
      cancelled = true;
    };
  }, [version]);

  const value = useMemo<SiteData>(() => {
    const settings = remote?.settings ?? DEFAULT_SETTINGS;
    const categories: Category[] = CATEGORIES.map((c) => ({ ...c, ...settings.categories[c.id] }));

    // Built-in components win if a server component reuses the same slug.
    const builtinSlugs = new Set(REGISTRY.map((e) => e.slug));
    const server = (remote?.components ?? []).filter((c) => !builtinSlugs.has(c.slug)).map(fromServer);
    const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));
    const entries = [...REGISTRY, ...server].sort(
      (a, b) => (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99) || a.name.localeCompare(b.name)
    );

    return {
      status,
      settings,
      categories,
      entries,
      documents: remote?.documents ?? [],
      getEntry: (slug) => entries.find((e) => e.slug === slug),
      entriesByCategory: (id) => entries.filter((e) => e.category === id),
      reload: () => setVersion((n) => n + 1),
    };
  }, [remote, status]);

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}
