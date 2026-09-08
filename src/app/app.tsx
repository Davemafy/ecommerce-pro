import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/sidebar';
import { TopBar } from '../components/layout/top-bar';

export function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      {mobileNavOpen && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <div className="content">
        <TopBar onMenu={() => setMobileNavOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}
