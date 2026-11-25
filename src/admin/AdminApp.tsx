import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { ApiError } from '../data/api';
import { useSiteData } from '../data/context';
import { adminApi, type AdminUser } from './adminApi';
import ComponentEditor from './ComponentEditor';
import ComponentsList from './ComponentsList';
import Dashboard from './Dashboard';
import DocumentEditor from './DocumentEditor';
import DocumentsList from './DocumentsList';
import MediaLibrary from './MediaLibrary';
import SettingsPage from './SettingsPage';
import { ToastProvider } from './ui';
import './admin.css';

type AuthState = { kind: 'checking' } | { kind: 'out'; offline?: boolean } | { kind: 'in'; user: AdminUser };

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthState>({ kind: 'checking' });

  useEffect(() => {
    document.title = 'Admin — UIComponents';
    // Keep the admin out of search engines (reuse the page's robots tag, so
    // there's never a second, conflicting one).
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    const previous = meta.content;
    meta.content = 'noindex, nofollow';
    adminApi
      .me()
      .then(({ user }) => setAuth({ kind: 'in', user }))
      .catch((e: ApiError) => setAuth({ kind: 'out', offline: e.status === 0 }));
    return () => {
      if (created) meta.remove();
      else meta.content = previous;
    };
  }, []);

  if (auth.kind === 'checking') return <div className="ad-center muted">Checking login…</div>;
  if (auth.kind === 'out') return <Login offline={auth.offline} onLogin={(user) => setAuth({ kind: 'in', user })} />;

  return (
    <ToastProvider>
      <AdminLayout user={auth.user} onLogout={() => setAuth({ kind: 'out' })} />
    </ToastProvider>
  );
}

function Login({ onLogin, offline }: { onLogin: (u: AdminUser) => void; offline?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(offline ? "Can't reach the server. Start it with: npm run dev:all" : '');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await adminApi.login(email, password);
      onLogin(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ad-center">
      <form className="ad-login" onSubmit={submit}>
        <span className="header__logo" aria-hidden="true" />
        <h1>Admin login</h1>
        <label className="ad-field">
          <span className="ad-field__label">Email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="ad-field">
          <span className="ad-field__label">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="ad-error">{error}</p>}
        <button className="ad-btn ad-btn--primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <Link to="/" className="ad-login__back">← Back to site</Link>
      </form>
    </div>
  );
}

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/components', label: 'Components' },
  { to: '/admin/documents', label: 'Documents' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/settings', label: 'Settings' },
];

function AdminLayout({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const navigate = useNavigate();
  const { reload } = useSiteData();

  const logout = async () => {
    await adminApi.logout().catch(() => undefined);
    onLogout();
    navigate('/admin');
  };

  // Changes made here should show on the public site straight away.
  useEffect(() => () => reload(), [reload]);

  return (
    <div className="ad">
      <aside className="ad-nav">
        <Link to="/admin" className="ad-nav__brand">
          <span className="header__logo" aria-hidden="true" />
          Admin
        </Link>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="ad-nav__link">
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ad-nav__foot">
          <a href="/" target="_blank" rel="noreferrer" className="ad-nav__link">
            View site ↗
          </a>
          <span className="ad-nav__user" title={user.email}>{user.email}</span>
          <button className="ad-btn ad-btn--ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="ad-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="components" element={<ComponentsList />} />
          <Route path="components/new" element={<ComponentEditor key="new" />} />
          <Route path="components/:id" element={<ComponentEditor />} />
          <Route path="documents" element={<DocumentsList />} />
          <Route path="documents/new" element={<DocumentEditor key="new" />} />
          <Route path="documents/:id" element={<DocumentEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<p className="muted">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
