import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError } from '../data/api';
import { useSiteData } from '../data/context';
import Markdown from './Markdown';
import NotFound from './NotFound';
import { useSeo } from './useSeo';

/** First real paragraph of Markdown as plain text, for the meta description. */
function summarize(md: string): string {
  const para = md
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|```|!\[|<|[-*>|]|\d+\.)/.test(p));
  const text = (para ?? '').replace(/[*_`>#[\]]|\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

interface Doc {
  slug: string;
  title: string;
  body: string;
  updatedAt: string;
}

export default function DocPage() {
  const { slug = '' } = useParams();
  const { settings } = useSiteData();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setError(null);
    api<Doc>('GET', `/api/public/documents/${encodeURIComponent(slug)}`)
      .then((d) => !cancelled && setDoc(d))
      .catch((e: ApiError) => !cancelled && setError(e.status));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useSeo({
    title: doc?.title ?? (error === 404 ? 'Not found' : settings.siteName),
    description: doc ? summarize(doc.body) : undefined,
    path: `/docs/${slug}`,
    noindex: error === 404,
  });

  if (error === 404) return <NotFound />;
  if (error) return <p className="muted">Couldn't load this document. Please try again.</p>;
  if (!doc) return <p className="muted">Loading…</p>;

  return (
    <article className="page doc">
      <p className="page__crumb">Docs</p>
      <h1 className="page__title">{doc.title}</h1>
      <p className="muted doc__updated">Updated {new Date(doc.updatedAt).toLocaleDateString()}</p>
      <Markdown source={doc.body} />
    </article>
  );
}
