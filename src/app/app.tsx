import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/sidebar';
import { TopBar } from '../components/layout/top-bar';

export function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location=useLocation();
  const isDashboard=location.pathname==='/';

  return (
    <div className={isDashboard?'app-shell dashboard-shell':'app-shell'}>
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      {mobileNavOpen && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <div className="content">
        {isDashboard?<button className="dashboard-mobile-menu-trigger" aria-label="Open navigation" onClick={()=>setMobileNavOpen(true)}><Menu/></button>:<TopBar onMenu={() => setMobileNavOpen(true)} />}
        <Outlet />
      </div>
    </div>
  );
}
