import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSiteData } from '../data/context';

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const { categories, entriesByCategory, documents } = useSiteData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K or "/" focuses search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea');
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.map((cat) => ({
      ...cat,
      items: entriesByCategory(cat.id).filter(
        (e) => !q || e.name.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [query, categories, entriesByCategory]);

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components…"
          aria-label="Search components"
        />
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/" end className="sidebar__link sidebar__link--home">
          Overview
        </NavLink>

        <section className="sidebar__group">
          <h3 className="sidebar__title">Tools</h3>
          <NavLink to="/palette" className="sidebar__link sidebar__link--tool">
            <span className="sidebar__tool-icon" aria-hidden="true" />
            Color Palette
            <span className="tag-new">New</span>
          </NavLink>
        </section>

        {documents.length > 0 && !query && (
          <section className="sidebar__group">
            <h3 className="sidebar__title">
              Docs
              <span>{documents.length}</span>
            </h3>
            {documents.map((d) => (
              <NavLink key={d.slug} to={`/docs/${d.slug}`} className="sidebar__link">
                {d.title}
              </NavLink>
            ))}
          </section>
        )}
        {groups.map((g) => (
          <section key={g.id} className="sidebar__group">
            <h3 className="sidebar__title">
              {g.label}
              <span>{g.items.length}</span>
            </h3>
            {g.items.map((e) => (
              <NavLink key={e.slug} to={`/components/${e.slug}`} className="sidebar__link">
                {e.name}
                {e.isNew && <span className="tag-new">New</span>}
              </NavLink>
            ))}
          </section>
        ))}
        {groups.length === 0 && <p className="sidebar__empty">No component matches “{query}”.</p>}
      </nav>
    </aside>
  );
}
