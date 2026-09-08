import { Bell, BookOpen, CircleHelp, ExternalLink, Grid3X3, LifeBuoy, Menu, Package, ShoppingCart, Users } from 'lucide-react';
import adminPfp from '../../assets/admin-pfp.png';
import { useToast } from '../ui/feedback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function TopBar({ onMenu }: { onMenu?: () => void }) {
  const toast = useToast();
  const openStorefront = () => toast('Storefront preview is not connected yet', 'success');
  return <header className="topbar">
      <button className="mobile-menu-trigger" aria-label="Open navigation" onClick={onMenu}><Menu /></button><div className="topbar-spacer"/><div className="topbar-actions">
    <DropdownMenu><DropdownMenuTrigger asChild><button className="topbar-icon notification-trigger" aria-label="Notifications"><Bell/><span className="notification-dot"/></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="notification-menu"><DropdownMenuLabel>Notifications</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem className="notification-item"><span className="notification-icon"><ShoppingCart/></span><span><b>New order received</b><small>Order #ORD-1009 for $349.00 · 2 min ago</small></span></DropdownMenuItem><DropdownMenuItem className="notification-item"><span className="notification-icon"><Package/></span><span><b>Low stock alert</b><small>Ergo Laptop Stand has 3 units left · 18 min ago</small></span></DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>toast('All notifications marked as read')}>Mark all as read</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    <DropdownMenu><DropdownMenuTrigger asChild><button className="topbar-icon" aria-label="Help"><CircleHelp/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Help & support</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>toast('Help center opened')}><BookOpen/>Help Center</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast('Support request started')}><LifeBuoy/>Contact Support</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    <DropdownMenu><DropdownMenuTrigger asChild><button className="topbar-icon" aria-label="Apps"><Grid3X3/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>CommercePro</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem><ShoppingCart/>Orders</DropdownMenuItem><DropdownMenuItem><Package/>Products</DropdownMenuItem><DropdownMenuItem><Users/>Customers</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    <span className="topbar-divider"/><button className="view-site" onClick={openStorefront}>View Site <ExternalLink/></button><img className="admin-avatar-image" src={adminPfp} alt="Admin User"/>
  </div></header>;
}
