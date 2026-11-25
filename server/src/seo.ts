import { readdir, readFile } from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, config } from './config.ts';
import { db } from './db.ts';
import { publishedComponents } from './routes/components.ts';
import { getSettings } from './settings.ts';

/*
 * SEO for a single-page app: every page request gets the real title,
 * description, canonical URL, Open Graph/Twitter tags, JSON-LD and a plain
 * HTML version of the content inside #root. Crawlers and link previews see
 * all of it without running JavaScript; React then takes over the page.
 */

interface Item {
  slug: string;
  name: string;
  description: string;
  category: string;
  languages: string[];
  updatedAt?: string;
}

interface Page {
  status: number;
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type: 'website' | 'article';
  jsonLd?: Record<string, unknown>[];
  body: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* ---------- Content sources ---------- */

let builtinCache: Item[] | null = null;

/** Built-in components: read their meta.ts files once (Node runs the TypeScript directly). */
async function builtinComponents(): Promise<Item[]> {
  if (builtinCache) return builtinCache;
  const lib = join(ROOT, 'src', 'library');
  const items: Item[] = [];
  for (const category of await readdir(lib).catch(() => [] as string[])) {
    for (const name of await readdir(join(lib, category)).catch(() => [] as string[])) {
      const dir = join(lib, category, name);
      try {
        const { meta } = (await import(pathToFileURL(join(dir, 'meta.ts')).href)) as {
          meta: { slug: string; name: string; description: string };
        };
        const files = await readdir(dir);
        const languages = [
          ...(files.includes(`${name}.tsx`) ? ['React'] : []),
          ...(files.includes('html') ? ['HTML/CSS/JS'] : []),
        ];
        items.push({ slug: meta.slug, name: meta.name, description: meta.description, category, languages });
      } catch {
        // Not a component folder.
      }
    }
  }
  builtinCache = items;
  return items;
}

async function allComponents(): Promise<Item[]> {
  const builtin = await builtinComponents();
  const taken = new Set(builtin.map((b) => b.slug));
  const uploaded = publishedComponents()
    .filter((c) => !taken.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      category: c.category,
      languages: [...(c.react ? ['React'] : []), ...(c.html ? ['HTML/CSS/JS'] : [])],
      updatedAt: c.updatedAt,
    }));
  return [...builtin, ...uploaded].sort((a, b) => a.name.localeCompare(b.name));
}

interface DocRow {
  slug: string;
  title: string;
  body: string;
  updated_at: string;
}
const publishedDocs = () =>
  db.prepare("SELECT slug, title, body, updated_at FROM documents WHERE status = 'published' ORDER BY sort, title").all() as unknown as DocRow[];

/** First real paragraph of Markdown as plain text (same rule as the site). */
function summarize(md: string): string {
  const para = md
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|```|!\[|<|[-*>|]|\d+\.)/.test(p));
  const text = (para ?? '').replace(/[*_`>#[\]]|\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

/* ---------- Pages ---------- */

export function originOf(req: IncomingMessage): string {
  if (config.siteUrl) return config.siteUrl;
  const proto = config.trustProxy
    ? String(req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim() || 'http'
    : config.cookieSecure
      ? 'https'
      : 'http';
  const host = String(req.headers.host ?? `localhost:${config.port}`).replace(/[^a-zA-Z0-9.:[\]-]/g, '');
  return `${proto}://${host}`;
}

async function resolvePage(pathname: string): Promise<Page> {
  const s = getSettings();
  const catLabel = (id: string) => s.categories[id]?.label ?? id;
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') {
    const items = await allComponents();
    const byCat = Object.keys(s.categories)
      .map((id) => ({ id, label: catLabel(id), items: items.filter((i) => i.category === id) }))
      .filter((g) => g.items.length);
    return {
      status: 200,
      title: s.siteName,
      description: s.hero.lead,
      path: '/',
      type: 'website',
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: s.siteName, description: s.hero.lead }],
      body: `<h1>${esc(`${s.hero.title} ${s.hero.accent}`.trim())}</h1><p>${esc(s.hero.lead)}</p>${byCat
        .map(
          (g) =>
            `<h2>${esc(g.label)}</h2><ul>${g.items
              .map((i) => `<li><a href="/components/${esc(i.slug)}">${esc(i.name)}</a> — ${esc(i.description)}</li>`)
              .join('')}</ul>`
        )
        .join('')}<p><a href="/palette">Color Palette Studio</a></p>`,
    };
  }

  const comp = /^\/components\/([a-z0-9-]+)$/.exec(path);
  if (comp) {
    const items = await allComponents();
    const item = items.find((i) => i.slug === comp[1]);
    if (item) {
      const related = items.filter((i) => i.category === item.category && i.slug !== item.slug).slice(0, 8);
      const langs = item.languages.join(' and ');
      return {
        status: 200,
        title: `${item.name} — ${catLabel(item.category)}`,
        description: `${item.description} Live preview and copy-ready ${langs} code.`,
        path,
        type: 'article',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: item.name,
            description: item.description,
            programmingLanguage: item.languages,
            ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Components', item: '/' },
              { '@type': 'ListItem', position: 2, name: catLabel(item.category) },
              { '@type': 'ListItem', position: 3, name: item.name },
            ],
          },
        ],
        body: `<nav><a href="/">Components</a> / ${esc(catLabel(item.category))}</nav><h1>${esc(item.name)}</h1><p>${esc(
          item.description
        )}</p><p>Available in ${esc(langs)}, with live preview, source code and usage.</p>${
          related.length
            ? `<h2>More ${esc(catLabel(item.category))}</h2><ul>${related
                .map((r) => `<li><a href="/components/${esc(r.slug)}">${esc(r.name)}</a></li>`)
                .join('')}</ul>`
            : ''
        }`,
      };
    }
  }

  const doc = /^\/docs\/([a-z0-9-]+)$/.exec(path);
  if (doc) {
    const d = publishedDocs().find((x) => x.slug === doc[1]);
    if (d) {
      const description = summarize(d.body) || `${d.title} — ${s.siteName} documentation.`;
      return {
        status: 200,
        title: d.title,
        description,
        path,
        type: 'article',
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'TechArticle', headline: d.title, description, dateModified: d.updated_at }],
        body: `<h1>${esc(d.title)}</h1><p>${esc(description)}</p>`,
      };
    }
  }

  if (path === '/palette') {
    const description =
      'Pick colours, set how much each one is used (60-30-10), and preview them on a banner and a website, with contrast checks and CSS/Tailwind export.';
    return {
      status: 200,
      title: 'Color Palette Studio',
      description,
      path,
      type: 'website',
      body: `<h1>Color Palette Studio</h1><p>${esc(description)}</p>`,
    };
  }

  if (path === '/admin' || path.startsWith('/admin/')) {
    return { status: 200, title: 'Admin', description: 'Admin panel', path, noindex: true, type: 'website', body: '' };
  }

  return {
    status: 404,
    title: 'Page not found',
    description: "That page doesn't exist.",
    path,
    noindex: true,
    type: 'website',
    body: `<h1>Page not found</h1><p><a href="/">Back to all components</a></p>`,
  };
}

/* ---------- HTML ---------- */

let template: string | null = null;

/** dist/index.html with this page's SEO tags and fallback content filled in. */
export async function renderPage(req: IncomingMessage, pathname: string): Promise<{ status: number; html: string } | null> {
  template ??= await readFile(join(config.distDir, 'index.html'), 'utf8').catch(() => null);
  if (!template) return null;

  const page = await resolvePage(pathname);
  const s = getSettings();
  const origin = originOf(req);
  const url = `${origin}${page.path}`;
  const title = page.title === s.siteName ? page.title : `${page.title} — ${s.siteName}`;
  const jsonLd = (page.jsonLd ?? []).map((data) =>
    // "</" can't appear inside the script, so "</script>" in content can't break out.
    `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
  );

  const tags = [
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${page.type}" />`,
    `<meta property="og:site_name" content="${esc(s.siteName)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    ...jsonLd,
  ].join('\n    ');

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
    // Drop the template's default tags; this page's tags replace them.
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/\s*<meta property="og:[^>]*>/g, '')
    .replace('</head>', () => `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root"><div class="seo-fallback">${page.body}</div></div>`);

  return { status: page.status, html };
}

/* ---------- sitemap.xml & robots.txt ---------- */

export async function sitemap(req: IncomingMessage): Promise<string> {
  const origin = originOf(req);
  const today = new Date().toISOString().slice(0, 10);
  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: '/', lastmod: today, priority: '1.0' },
    { loc: '/palette', priority: '0.6' },
    ...(await allComponents()).map((c) => ({ loc: `/components/${c.slug}`, lastmod: c.updatedAt?.slice(0, 10), priority: '0.8' })),
    ...publishedDocs().map((d) => ({ loc: `/docs/${d.slug}`, lastmod: d.updated_at.slice(0, 10), priority: '0.5' })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${esc(origin + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`
  )
  .join('\n')}
</urlset>
`;
}

export const robots = (req: IncomingMessage) => `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${originOf(req)}/sitemap.xml
`;
