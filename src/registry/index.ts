import type { ComponentType } from 'react';
import { CATEGORIES } from './categories';
import { buildSrcdoc } from './srcdoc';
import type { CategoryId, ComponentMeta, RegistryEntry, SourceFile, Variant } from './types';

/*
 * Auto-discovery. Every folder library/<category>/<Name>/ with a meta.ts
 * becomes a page. A folder can hold one or both versions:
 *
 *   <Name>.tsx + <Name>.css            → React version
 *   html/index.html, style.css, script.js → HTML / CSS / JS version
 *
 * Previews run the real files and the Code tab shows those same files
 * (via ?raw), so code and preview can never drift apart.
 */
type AnyComponent = ComponentType<Record<string, unknown>>;

const metas = import.meta.glob<ComponentMeta>('../library/*/*/meta.ts', { eager: true, import: 'meta' });
const components = import.meta.glob<AnyComponent>('../library/*/*/*.tsx', { eager: true, import: 'default' });
const reactSources = import.meta.glob<string>('../library/*/*/*.{tsx,css}', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const htmlSources = import.meta.glob<string>('../library/*/*/html/*.{html,css,js}', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const categoryIds = new Set<string>(CATEGORIES.map((c) => c.id));

// Order the HTML files the way people read them.
const HTML_FILES = [
  { name: 'index.html', language: 'html' },
  { name: 'style.css', language: 'css' },
  { name: 'script.js', language: 'js' },
] as const;

function buildEntry(metaPath: string, meta: ComponentMeta): RegistryEntry {
  const dir = metaPath.slice(0, -'/meta.ts'.length);
  const [, , category, id] = dir.split('/');
  if (!categoryIds.has(category)) {
    throw new Error(`Unknown category "${category}" in ${metaPath}`);
  }

  const variants: Variant[] = [];

  // React version
  const Component = components[`${dir}/${id}.tsx`];
  if (Component) {
    const files: SourceFile[] = [];
    for (const ext of ['tsx', 'css'] as const) {
      const code = reactSources[`${dir}/${id}.${ext}`];
      if (code !== undefined) files.push({ filename: `${id}.${ext}`, language: ext, code });
    }
    variants.push({ language: 'react', files });
  }

  // HTML / CSS / JS version
  let srcdoc: string | undefined;
  const html = htmlSources[`${dir}/html/index.html`];
  if (html !== undefined) {
    const files: SourceFile[] = [];
    for (const f of HTML_FILES) {
      const code = htmlSources[`${dir}/html/${f.name}`];
      if (code !== undefined) files.push({ filename: f.name, language: f.language, code });
    }
    variants.push({ language: 'html', files });
    const assetBase = meta.assets ? `${import.meta.env.BASE_URL}showcase/${meta.slug}/` : undefined;
    srcdoc = buildSrcdoc(html, htmlSources[`${dir}/html/style.css`], htmlSources[`${dir}/html/script.js`], {
      assetBase,
      fill: meta.stage === 'fill',
    });
  }

  if (variants.length === 0) {
    throw new Error(`${dir} has a meta.ts but no ${id}.tsx and no html/index.html`);
  }

  return { ...meta, id, source: 'builtin', category: category as CategoryId, Component, srcdoc, variants };
}

const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));

export const REGISTRY: RegistryEntry[] = Object.entries(metas)
  .map(([path, meta]) => buildEntry(path, meta))
  .sort(
    (a, b) =>
      order.get(a.category)! - order.get(b.category)! || a.name.localeCompare(b.name)
  );

export const getEntry = (slug: string) => REGISTRY.find((e) => e.slug === slug);

export const entriesByCategory = (id: CategoryId) => REGISTRY.filter((e) => e.category === id);

export { CATEGORIES };
export type { RegistryEntry, CategoryId };
