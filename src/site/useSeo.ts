import { useEffect } from 'react';
import { useSiteData } from '../data/context';

interface Seo {
  title: string;
  description?: string;
  /** Path of this page, e.g. /components/split-text. Defaults to the current path. */
  path?: string;
  /** Hide the page from search engines (404s, private pages). */
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Keeps <title>, description, canonical and social tags right while the
 * visitor moves between pages. (The server sends the same tags in the first
 * HTML, so crawlers and link previews see them without running JavaScript.)
 */
export function useSeo({ title, description, path, noindex }: Seo) {
  const { settings } = useSiteData();
  const desc = description ?? settings.hero.lead;

  useEffect(() => {
    const full = title === settings.siteName ? title : `${title} — ${settings.siteName}`;
    const url = `${window.location.origin}${path ?? window.location.pathname}`;
    document.title = full;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', settings.siteName);
    setMeta('name', 'twitter:title', full);
    setMeta('name', 'twitter:description', desc);
    setCanonical(url);
  }, [title, desc, path, noindex, settings.siteName]);
}
