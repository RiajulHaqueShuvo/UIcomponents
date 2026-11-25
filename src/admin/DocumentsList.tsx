import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, formatDate, type DocSummary } from './adminApi';
import { EmptyState, StatusBadge } from './ui';

export default function DocumentsList() {
  const [docs, setDocs] = useState<DocSummary[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.documents().then(setDocs).catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="ad-page">
      <header className="ad-head">
        <div>
          <h1>Documents</h1>
          <p className="muted">Guides and pages written in Markdown. Published ones appear under “Docs” in the site menu.</p>
        </div>
        <Link to="/admin/documents/new" className="ad-btn ad-btn--primary">+ New document</Link>
      </header>

      {error && <p className="ad-error">{error}</p>}
      {!docs && !error && <p className="muted">Loading…</p>}
      {docs && docs.length === 0 && (
        <EmptyState title="No documents yet">
          <p className="muted">Write a guide, or upload an existing .md file.</p>
          <Link to="/admin/documents/new" className="ad-btn ad-btn--primary">+ New document</Link>
        </EmptyState>
      )}
      {docs && docs.length > 0 && (
        <div className="ad-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Order</th>
                <th>Words</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/admin/documents/${d.id}`} className="ad-table__title">{d.title}</Link>
                    <code className="ad-table__slug">{d.slug}</code>
                  </td>
                  <td>{d.sort}</td>
                  <td>{d.words.toLocaleString()}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className="muted">{formatDate(d.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
