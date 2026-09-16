import {
  BarChart3,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import adminPfp from '../../assets/admin-pfp.png';
import { endSession } from '../../features/auth/auth-session';

const items: Array<[string, string, LucideIcon]> = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/orders', 'Orders', ShoppingCart],
  ['/products', 'Products', Package],
  ['/customers', 'Customers', Users],
  ['/inventory', 'Inventory', Boxes],
  ['/reports', 'Reports', BarChart3],
  ['/settings', 'Settings', Settings],
];

export function Sidebar({ mobileOpen = false, onNavigate }: { mobileOpen?: boolean; onNavigate?: () => void }) {
  const navigate=useNavigate();
  const logout=()=>{endSession();onNavigate?.();navigate('/login',{replace:true});};
  return (
    <aside className={`figma-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="figma-sidebar-top">
        <div className="figma-brand"><span className="figma-brand-icon"><Store /></span><div className="figma-brand-copy"><strong>CommercePro</strong><span>Enterprise Admin</span></div></div>
        <nav className="figma-nav">{items.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
      </div>

      <div className="figma-sidebar-profile">
        <NavLink to="/settings/general" onClick={onNavigate} className="figma-profile-link"><img className="figma-profile-image" src={adminPfp} alt="Admin User" /><span>Admin User</span><ExternalLink className="figma-external-icon" aria-hidden="true" /></NavLink>
        <button className="figma-sidebar-logout" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut/></button>
      </div>
    </aside>
  );
}
