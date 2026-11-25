import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import HomePage from '../site/HomePage';
import ComponentPage from '../site/ComponentPage';
import NotFound from '../site/NotFound';
import PremiumProvider from '../premium/PremiumProvider';
import PalettePage from '../palette/PalettePage';
import SiteDataProvider from '../data/SiteDataProvider';
import { BASE, STATIC } from './env';

// Separate chunks: visitors never download the admin, and the Markdown
// renderer only loads when someone opens a doc.
const AdminApp = lazy(() => import('../admin/AdminApp'));
const DocPage = lazy(() => import('../site/DocPage'));

// Old links used hash URLs (/#/components/x). Turn them into real paths
// before the router starts, so bookmarks and shared links keep working.
if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', BASE + window.location.hash.slice(1));
}

// Real URLs (/components/split-text) so every page can be indexed by search
// engines. The server answers every page path with the app (plus SEO tags).
const router = createBrowserRouter([
  {
    path: 'admin/*',
    element: STATIC ? (
      <p className="muted" style={{ padding: 40 }}>The admin panel needs the server version of this site.</p>
    ) : (
      <Suspense fallback={<p className="muted" style={{ padding: 40 }}>Loading admin…</p>}>
        <AdminApp />
      </Suspense>
    ),
  },
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'components/:slug', element: <ComponentPage /> },
      {
        path: 'docs/:slug',
        element: (
          <Suspense fallback={<p className="muted">Loading…</p>}>
            <DocPage />
          </Suspense>
        ),
      },
      { path: 'palette', element: <PalettePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], { basename: BASE || '/' });

export default function App() {
  return (
    <SiteDataProvider>
      <PremiumProvider>
        <RouterProvider router={router} />
      </PremiumProvider>
    </SiteDataProvider>
  );
}
