import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BookOpen, CircleHelp, ExternalLink, Grid3X3, LifeBuoy, LogOut, Menu, Package, Search, ShoppingCart, UserRound, Users } from 'lucide-react';
import { useToast } from '../ui/feedback';
import { useLocation, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { notificationService, unwrapList } from '../../api/services';
import { logout } from '../../features/auth/auth-session';
import { useCurrentAdmin } from '../../features/auth/use-current-admin';

function notificationDestination(type = '') {
  const value = type.toLowerCase();
  if (value.includes('stock')) return '/inventory';
  if (value.includes('order') || value.includes('payment') || value.includes('refund')) return '/orders';
  return '/';
}

export function TopBar({ onMenu }: { onMenu?: () => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL;
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;
  const isOrderDetail = /^\/orders\/[^/]+$/.test(location.pathname);
  const isProductDetail = /^\/products\/[^/]+$/.test(location.pathname);
  const isDetailPage = isOrderDetail || isProductDetail;
  const { data: admin } = useCurrentAdmin();

  const notificationQuery = useQuery({
    queryKey: ['notification-history', 5],
    queryFn: () => notificationService.history({ page: 1, limit: 5 }),
    staleTime: 30_000,
    retry: false,
  });

  const notifications = unwrapList<any>(notificationQuery.data, ['notifications']);
  const unread = notifications.filter((item) => {
    if ('read' in item) return item.read === false;
    if ('isRead' in item) return item.isRead === false;
    return item.readAt == null;
  });
  const markAllMutation = useMutation({
    mutationFn: notificationService.readAll,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notification-history'] });
      toast('Notifications marked as read');
    },
    onError: (cause: any) => toast(cause?.message || 'Could not update notifications', 'error'),
  });

  const openStorefront = () => { if (storefrontUrl) window.open(storefrontUrl, '_blank', 'noopener,noreferrer'); };
  const openSupport = () => {
    if (!supportEmail) return;
    window.location.href = `mailto:${supportEmail}?subject=CommercePro%20Admin%20Support`;
  };
  const submitSearch = () => { const query = search.trim(); if (query) navigate(`/products?search=${encodeURIComponent(query)}`); };
  const signOut = async () => { await logout(); navigate('/login', { replace: true }); };
  const adminName = admin?.name || 'Administrator';
  const avatar = admin?.avatar || '';
  const initials = adminName.split(' ').filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

  const Notifications = () => <DropdownMenu>
    <DropdownMenuTrigger asChild><button className="topbar-icon notification-trigger" aria-label="Notifications"><Bell/>{unread.length > 0 && <span className="notification-dot"/>}</button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="notification-menu">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel><DropdownMenuSeparator/>
      {notificationQuery.isLoading && <DropdownMenuItem disabled>Loading notifications…</DropdownMenuItem>}
      {!notificationQuery.isLoading && !notifications.length && <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>}
      {notifications.slice(0, 5).map((item: any, index: number) => {
        const type = item.type || item.eventType || 'notification';
        const title = item.title || String(type).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
        const detail = item.message || item.body || item.description || 'Store activity';
        return <DropdownMenuItem className="notification-item" key={item._id || item.id || index} onSelect={() => navigate(notificationDestination(type))}><span className="notification-icon">{String(type).includes('stock') ? <Package/> : <ShoppingCart/>}</span><span><b>{title}</b><small>{detail}</small></span></DropdownMenuItem>;
      })}
      {notifications.length > 0 && <><DropdownMenuSeparator/><DropdownMenuItem disabled={!unread.length || markAllMutation.isPending} onSelect={() => markAllMutation.mutate()}>{markAllMutation.isPending ? 'Updating…' : 'Mark all as read'}</DropdownMenuItem></>}
    </DropdownMenuContent>
  </DropdownMenu>;

  const Help = () => <DropdownMenu>
    <DropdownMenuTrigger asChild><button className="topbar-icon" aria-label="Help"><CircleHelp/></button></DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuLabel>Help & support</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => navigate('/settings/general')}><BookOpen/>Admin settings</DropdownMenuItem>{supportEmail && <DropdownMenuItem onSelect={openSupport}><LifeBuoy/>Contact Support</DropdownMenuItem>}</DropdownMenuContent>
  </DropdownMenu>;

  const Profile = () => <DropdownMenu>
    <DropdownMenuTrigger asChild><button className="avatar-menu-trigger" aria-label="Admin account">{avatar ? <img className="admin-avatar-image" src={avatar} alt={adminName}/> : <span className="admin-avatar-image admin-avatar-fallback" aria-hidden="true">{initials}</span>}</button></DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuLabel>{adminName}</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => navigate('/settings/general')}><UserRound/>Account settings</DropdownMenuItem><DropdownMenuItem onSelect={signOut}><LogOut/>Sign out</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenu>;

  if (isDetailPage) {
    return <header className="topbar detail-topbar"><button className="mobile-menu-trigger" aria-label="Open navigation" onClick={onMenu}><Menu/></button><strong className="detail-topbar-title">{isProductDetail ? 'Products' : 'Orders'}</strong><label className="detail-topbar-search"><Search/><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="Search..." aria-label="Search"/></label><div className="topbar-actions"><Notifications/><Help/><span className="detail-topbar-divider"/>{supportEmail && <button className="detail-topbar-support" onClick={openSupport}>Support</button>}<button className="primary detail-topbar-new" onClick={() => navigate('/products?new=1')}>New Product</button><Profile/></div></header>;
  }

  return <header className="topbar"><button className="mobile-menu-trigger" aria-label="Open navigation" onClick={onMenu}><Menu/></button><div className="topbar-spacer"/><div className="topbar-actions"><Notifications/><Help/><DropdownMenu><DropdownMenuTrigger asChild><button className="topbar-icon" aria-label="Apps"><Grid3X3/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>CommercePro</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => navigate('/orders')}><ShoppingCart/>Orders</DropdownMenuItem><DropdownMenuItem onSelect={() => navigate('/products')}><Package/>Products</DropdownMenuItem><DropdownMenuItem onSelect={() => navigate('/customers')}><Users/>Customers</DropdownMenuItem></DropdownMenuContent></DropdownMenu><span className="topbar-divider"/><button className="view-site" disabled={!storefrontUrl} title={storefrontUrl ? 'Open storefront' : 'Storefront URL is not configured'} onClick={openStorefront}>View Site <ExternalLink/></button><Profile/></div></header>;
}
