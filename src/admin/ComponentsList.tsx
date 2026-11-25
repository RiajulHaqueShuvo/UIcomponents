import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../data/context';
import { adminApi, formatDate, type ComponentSummary } from './adminApi';
import { EmptyState, StatusBadge } from './ui';

export default function ComponentsList() {
  const [items, setItems] = useState<ComponentSummary[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showBuiltin, setShowBuiltin] = useState(false);
  const { entries, categories } = useSiteData();
  const label = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  useEffect(() => {
    adminApi.components().then(setItems).catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((c) => !q || `${c.name} ${c.slug} ${c.category}`.toLowerCase().includes(q));
  }, [items, query]);

  const builtin = entries.filter((e) => e.source === 'builtin');

  return (
    <div className="ad-page">
      <header className="ad-head">
        <div>
          <h1>Components</h1>
          <p className="muted">Components you upload here appear on the site when published.</p>
        </div>
        <Link to="/admin/components/new" className="ad-btn ad-btn--primary">+ New component</Link>
      </header>

      <input
        className="ad-search"
        placeholder="Search by name, slug or category…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {error && <p className="ad-error">{error}</p>}
      {!items && !error && <p className="muted">Loading…</p>}
      {items && items.length === 0 && (
        <EmptyState title="No uploaded components yet">
          <p className="muted">Add one with React code, HTML / CSS / JS, or both.</p>
          <Link to="/admin/components/new" className="ad-btn ad-btn--primary">+ New component</Link>
        </EmptyState>
      )}

      {filtered.length > 0 && (
        <div className="ad-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Versions</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/admin/components/${c.id}`} className="ad-table__title">{c.name}</Link>
                    <code className="ad-table__slug">{c.slug}</code>
                    {c.compileError && <span className="ad-badge ad-badge--error">Code error</span>}
                  </td>
                  <td>{label(c.category)}</td>
                  <td>
                    {c.hasReact && <span className="lang-chip lang-chip--react">React</span>}{' '}
                    {c.hasHtml && <span className="lang-chip lang-chip--html">HTML</span>}
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="muted">{formatDate(c.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="ad-card">
        <button className="ad-collapse" onClick={() => setShowBuiltin((s) => !s)} aria-expanded={showBuiltin}>
          {showBuiltin ? '▾' : '▸'} Built-in components ({builtin.length}) <span className="muted">— live in the code (src/library), read-only here</span>
        </button>
        {showBuiltin && (
          <ul className="ad-builtin">
            {builtin.map((e) => (
              <li key={e.slug}>
                <a href={`/components/${e.slug}`} target="_blank" rel="noreferrer">{e.name}</a>
                <span className="muted">{label(e.category)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
