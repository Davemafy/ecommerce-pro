import {
  BarChart3,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import adminPfp from '../../assets/figma-shell/admin-pfp.png';

const items = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/orders', 'Orders', ShoppingCart],
  ['/products', 'Products', Package],
  ['/customers', 'Customers', Users],
  ['/inventory', 'Inventory', Boxes],
  ['/reports', 'Reports', BarChart3],
  ['/settings', 'Settings', Settings],
];

export function Sidebar() {
  return (
    <aside className="figma-sidebar">
      <div className="figma-sidebar-top">
        <div className="figma-brand">
          <span className="figma-brand-icon"><Store /></span>
          <div className="figma-brand-copy">
            <strong>CommercePro</strong>
            <span>Enterprise Admin</span>
          </div>
        </div>

        <nav className="figma-nav">
          {items.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'is-active' : ''}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="figma-sidebar-profile">
        <NavLink to="/settings/profile" className="figma-profile-link">
          <img className="figma-profile-image" src={adminPfp} alt="" />
          <span>Admin User</span>
          <ExternalLink className="figma-external-icon" aria-hidden="true" />
        </NavLink>
      </div>
    </aside>
  );
}
