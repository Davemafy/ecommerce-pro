import { CalendarDays, MoreVertical, Package, ShoppingBag, TriangleAlert, Users, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExportButton } from '../../components/ui/export-button';
import { useStore } from '../../data/store';

function RevenueChart({ values }: { values: number[] }) {
  const chartValues = values.length > 1 ? values : [0, values[0] ?? 0];
  const max = Math.max(...chartValues, 1);
  const width = 600;
  const height = 190;
  const padding = 14;
  const points = chartValues.map((value, index) => {
    const x = padding + (index / Math.max(1, chartValues.length - 1)) * (width - padding * 2);
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  });
  const area = `${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`;

  return <div className="dashboard-chart-canvas" aria-label="Revenue trend chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img">
      <defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity=".16"/><stop offset="100%" stopColor="#4f46e5" stopOpacity=".02"/></linearGradient></defs>
      {[.25,.5,.75].map((ratio)=><line key={ratio} x1="0" x2={width} y1={height*ratio} y2={height*ratio} className="dashboard-chart-grid"/>)}
      <polygon points={area} fill="url(#revenue-fill)"/>
      <polyline points={points.join(' ')} fill="none" className="dashboard-chart-line"/>
    </svg>
  </div>;
}

export function DashboardPage(){
  const {data}=useStore();
  const navigate=useNavigate();
  const revenue=data.orders.reduce((sum,order)=>sum+order.total,0);
  const pending=data.orders.filter((order)=>order.status.toLowerCase()==='pending').length;
  const revenueValues=[...data.orders].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()).map((order)=>order.total);
  const lowStock=data.products.filter((product)=>product.status==='Active'&&product.stock<=12).sort((a,b)=>a.stock-b.stock).slice(0,3);
  const recentOrders=[...data.orders].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,3);
  const productName=(sku:string)=>data.products.find((product)=>product.sku===sku)?.name||sku;

  const kpis=[
    {label:'TOTAL REVENUE',value:`$${revenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,detail:'+12% from last week',icon:<WalletCards/>},
    {label:'TOTAL ORDERS',value:data.orders.length.toLocaleString(),detail:'+5% from last week',icon:<ShoppingBag/>},
    {label:'NEW CUSTOMERS',value:data.customers.length.toLocaleString(),detail:'+8% from last week',icon:<Users/>},
    {label:'PENDING ORDERS',value:String(pending),detail:'Requires attention',icon:<TriangleAlert/>,danger:true},
  ];

  return <main className="dashboard-figma">
    <header className="dashboard-header">
      <div><h1>Overview</h1><p>Track your store's performance and recent activities.</p></div>
      <div className="dashboard-header-actions"><button><CalendarDays/>Last 7 Days</button><ExportButton label="Export Report"/></div>
    </header>

    <section className="dashboard-kpis">{kpis.map((item)=><article key={item.label} className={item.danger?'dashboard-kpi danger':'dashboard-kpi'}><div className="dashboard-kpi-label"><span>{item.label}</span>{item.icon}</div><strong>{item.value}</strong><small>{item.detail}</small></article>)}</section>

    <section className="dashboard-main-row">
      <article className="dashboard-card dashboard-revenue-card"><header><h2>Revenue Trend</h2><button className="bare" aria-label="Revenue chart options"><MoreVertical/></button></header><RevenueChart values={revenueValues}/></article>
      <article className="dashboard-card dashboard-stock-card"><header><h2>Low Stock Alerts</h2><span className="dashboard-alert-count">{lowStock.length}</span></header><div className="dashboard-stock-list">{lowStock.length?lowStock.map((product)=><div className="dashboard-stock-item" key={product.id}><span className="dashboard-stock-icon"><Package/></span><div><strong>{product.name}</strong><small>{product.stock} units left</small></div><button className="bare dashboard-restock" onClick={()=>navigate('/inventory')}>Restock</button></div>):<p className="dashboard-empty-note">No low stock products right now.</p>}</div></article>
    </section>

    <section className="dashboard-card dashboard-orders-card"><header><h2>Recent Orders</h2><button className="bare dashboard-view-all" onClick={()=>navigate('/orders')}>View All</button></header><div className="dashboard-orders-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>PRODUCT</th><th>STATUS</th><th className="number">AMOUNT</th></tr></thead><tbody>{recentOrders.map((order)=><tr key={order.id} onClick={()=>navigate(`/orders/${order.id}`)}><td className="mono">#{order.id}</td><td>{order.customer}</td><td>{productName(order.sku)}</td><td><span className={`status-chip ${order.status.toLowerCase()}`}>{order.status}</span></td><td className="number">${order.total.toFixed(2)}</td></tr>)}</tbody></table></div></section>
  </main>;
}
