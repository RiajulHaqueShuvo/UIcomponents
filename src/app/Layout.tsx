import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../site/Header';
import Sidebar from '../site/Sidebar';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  // New page: close the mobile drawer and start at the top.
  useEffect(() => {
    setDrawerOpen(false);
    // 'instant' overrides the global smooth scrolling, which would otherwise
    // leave the new page part-way down (and off-screen previews never start).
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="layout">
      <Header onMenu={() => setDrawerOpen((o) => !o)} />
      <div className="layout__body">
        <Sidebar open={drawerOpen} />
        {drawerOpen && (
          <button
            className="layout__scrim"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <main className="layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
