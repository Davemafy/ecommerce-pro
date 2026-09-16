import { useState } from 'react';
import { Bell, BookOpen, CircleHelp, ExternalLink, Grid3X3, LifeBuoy, LogOut, Menu, Package, Search, ShoppingCart, UserRound, Users } from 'lucide-react';
import adminPfp from '../../assets/admin-pfp.png';
import { useToast } from '../ui/feedback';
import { useLocation, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { endSession } from '../../features/auth/auth-session';

export function TopBar({ onMenu }: { onMenu?: () => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [hasUnread,setHasUnread]=useState(true);
  const isOrderDetail = /^\/orders\/[^/]+$/.test(location.pathname);
  const isProductDetail = /^\/products\/[^/]+$/.test(location.pathname);
  const isDetailPage = isOrderDetail || isProductDetail;

  const openStorefront = () => {
    const url = import.meta.env.VITE_STOREFRONT_URL;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else toast('Storefront preview is not configured for this environment','error');
  };
  const openSupport=()=>{window.location.href='mailto:support@commercepro.com?subject=CommercePro%20Admin%20Support';};
  const submitSearch = () => { const query = search.trim(); if (query) navigate(`/products?search=${encodeURIComponent(query)}`); };
  const logout=()=>{endSession();navigate('/login',{replace:true});};

  const Notifications=()=> <DropdownMenu>
    <DropdownMenuTrigger asChild><button className="topbar-icon notification-trigger" aria-label="Notifications"><Bell/>{hasUnread&&<span className="notification-dot"/>}</button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="notification-menu">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel><DropdownMenuSeparator/>
      <DropdownMenuItem className="notification-item" onSelect={()=>navigate('/orders')}><span className="notification-icon"><ShoppingCart/></span><span><b>Order activity</b><small>{hasUnread?'A recent order needs review':'You are all caught up'}</small></span></DropdownMenuItem>
      <DropdownMenuItem className="notification-item" onSelect={()=>navigate('/inventory')}><span className="notification-icon"><Package/></span><span><b>Low stock alert</b><small>Review products near their reorder point</small></span></DropdownMenuItem>
      <DropdownMenuSeparator/><DropdownMenuItem disabled={!hasUnread} onSelect={()=>{setHasUnread(false);toast('Notifications marked as read')}}>Mark all as read</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;

  const Help=()=> <DropdownMenu>
    <DropdownMenuTrigger asChild><button className="topbar-icon" aria-label="Help"><CircleHelp/></button></DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuLabel>Help & support</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>navigate('/settings/general')}><BookOpen/>Admin settings</DropdownMenuItem><DropdownMenuItem onSelect={openSupport}><LifeBuoy/>Contact Support</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenu>;

  const Profile=()=> <DropdownMenu>
    <DropdownMenuTrigger asChild><button className="avatar-menu-trigger" aria-label="Admin account"><img className="admin-avatar-image" src={adminPfp} alt="Admin User"/></button></DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuLabel>Admin User</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>navigate('/settings/general')}><UserRound/>Account settings</DropdownMenuItem><DropdownMenuItem onSelect={logout}><LogOut/>Sign out</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenu>;

  if (isDetailPage) {
    return <header className="topbar detail-topbar"><button className="mobile-menu-trigger" aria-label="Open navigation" onClick={onMenu}><Menu /></button><strong className="detail-topbar-title">{isProductDetail?'Products':'Dashboard'}</strong><label className="detail-topbar-search"><Search /><input value={search} onChange={(event)=>setSearch(event.target.value)} onKeyDown={(event)=>{ if(event.key==='Enter') submitSearch(); }} placeholder="Search..." aria-label="Search" /></label><div className="topbar-actions"><Notifications/><Help/><span className="detail-topbar-divider"/><button className="detail-topbar-support" onClick={openSupport}>Support</button><button className="primary detail-topbar-new" onClick={()=>navigate('/products?new=1')}>New Product</button><Profile/></div></header>;
  }

  return <header className="topbar"><button className="mobile-menu-trigger" aria-label="Open navigation" onClick={onMenu}><Menu /></button><div className="topbar-spacer"/><div className="topbar-actions"><Notifications/><Help/><DropdownMenu><DropdownMenuTrigger asChild><button className="topbar-icon" aria-label="Apps"><Grid3X3/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>CommercePro</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>navigate('/orders')}><ShoppingCart/>Orders</DropdownMenuItem><DropdownMenuItem onSelect={()=>navigate('/products')}><Package/>Products</DropdownMenuItem><DropdownMenuItem onSelect={()=>navigate('/customers')}><Users/>Customers</DropdownMenuItem></DropdownMenuContent></DropdownMenu><span className="topbar-divider"/><button className="view-site" onClick={openStorefront}>View Site <ExternalLink/></button><Profile/></div></header>;
}
