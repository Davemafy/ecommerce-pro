import { useState } from 'react';
import { AlertTriangle, Menu, RefreshCw } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/sidebar';
import { TopBar } from '../components/layout/top-bar';
import { useStore } from '../data/store';

export function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location=useLocation();
  const {isLoading,error,reload}=useStore();
  const isDashboard=location.pathname==='/';

  return (
    <div className={isDashboard?'app-shell dashboard-shell':'app-shell'}>
      <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      {mobileNavOpen && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <div className="content">
        {isDashboard?<button className="dashboard-mobile-menu-trigger" aria-label="Open navigation" onClick={()=>setMobileNavOpen(true)}><Menu/></button>:<TopBar onMenu={() => setMobileNavOpen(true)} />}
        {isLoading?<AppLoadingState/>:error?<AppDataError onRetry={()=>reload()}/>:<Outlet />}
      </div>
    </div>
  );
}

function AppLoadingState(){
  return <main className="app-state-page" aria-label="Loading dashboard data"><div className="app-state-heading"><span className="skeleton-bone"/><span className="skeleton-bone short"/></div><div className="app-state-grid">{Array.from({length:4},(_,index)=><span className="skeleton-bone app-state-card" key={index}/>)}</div><span className="skeleton-bone app-state-panel"/></main>;
}

function AppDataError({onRetry}:{onRetry:()=>void}){
  return <main className="app-state-page"><section className="app-data-error"><span><AlertTriangle/></span><h1>We couldn't load the store data</h1><p>The dashboard is still intact. Retry the data request to continue.</p><button className="primary" onClick={onRetry}><RefreshCw/>Try again</button></section></main>;
}
