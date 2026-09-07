import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/sidebar';
import { TopBar } from '../components/layout/top-bar';

export function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content">
        <TopBar />
        <Outlet />
      </div>
    </div>
  );
}
