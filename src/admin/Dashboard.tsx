import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../data/context';
import { adminApi, formatDate, type Stats } from './adminApi';
import { StatusBadge } from './ui';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const { entries } = useSiteData();
  const builtin = entries.filter((e) => e.source === 'builtin').length;

  useEffect(() => {
    adminApi.stats().then(setStats).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="ad-error">{error}</p>;
  if (!stats) return <p className="muted">Loading…</p>;

  const cards = [
    { label: 'Uploaded components', value: stats.components, sub: `${stats.published} published · ${stats.drafts} drafts`, to: '/admin/components' },
    { label: 'Built-in components', value: builtin, sub: 'From the code library', to: '/admin/components' },
    { label: 'Documents', value: stats.documents, sub: 'Guides and pages', to: '/admin/documents' },
    { label: 'Media files', value: stats.media, sub: 'Images and files', to: '/admin/media' },
  ];

  return (
    <div className="ad-page">
      <header className="ad-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Everything on the site, in one place.</p>
        </div>
        <div className="ad-head__actions">
          <Link to="/admin/components/new" className="ad-btn ad-btn--primary">+ New component</Link>
          <Link to="/admin/documents/new" className="ad-btn">+ New document</Link>
        </div>
      </header>

      {stats.compileErrors > 0 && (
        <p className="ad-alert">
          {stats.compileErrors} component{stats.compileErrors > 1 ? 's have' : ' has'} React code that doesn't
          compile. Their React preview is hidden until it's fixed.
        </p>
      )}

      <div className="ad-stats">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="ad-stat">
            <span className="ad-stat__label">{c.label}</span>
            <strong>{c.value}</strong>
            <span className="muted">{c.sub}</span>
          </Link>
        ))}
      </div>

      <section className="ad-card">
        <h2>Recent changes</h2>
        {stats.recent.length === 0 ? (
          <p className="muted">Nothing yet. Create your first component or document.</p>
        ) : (
          <ul className="ad-recent">
            {stats.recent.map((r) => (
              <li key={`${r.kind}-${r.id}`}>
                <Link to={`/admin/${r.kind === 'component' ? 'components' : 'documents'}/${r.id}`}>{r.title}</Link>
                <span className="ad-recent__kind">{r.kind}</span>
                <StatusBadge status={r.status} />
                <span className="muted">{formatDate(r.updatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
