import { CalendarDays, ChevronDown, MoreVertical, Package, ShoppingBag, TriangleAlert, Users, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExportButton } from '../../components/ui/export-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useStore } from '../../data/store';
import { buildPeriodRevenueSeries, totalRevenue } from '../../utils/analytics';

const ranges=['Last 7 Days','Last 30 Days','Last 90 Days','This Year'];

function buildSmoothPath(points: Array<{x:number;y:number}>) {
  if (points.length < 2) return '';
  let path=`M ${points[0].x} ${points[0].y}`;
  for(let index=0; index<points.length-1; index+=1){
    const current=points[index];
    const next=points[index+1];
    const previous=points[index-1]??current;
    const after=points[index+2]??next;
    const control1X=current.x+(next.x-previous.x)/6;
    const control1Y=current.y+(next.y-previous.y)/6;
    const control2X=next.x-(after.x-current.x)/6;
    const control2Y=next.y-(after.y-current.y)/6;
    path+=` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${next.x} ${next.y}`;
  }
  return path;
}

function RevenueChart({ values, labels }: { values: number[]; labels:string[] }) {
  const max=Math.max(...values,1);
  const width=600;
  const height=188;
  const top=18;
  const bottom=26;
  const points=values.map((value,index)=>({
    x:(index/Math.max(values.length-1,1))*width,
    y:top+(1-value/max)*(height-top-bottom),
  }));
  const line=buildSmoothPath(points);
  const area=`${line} L ${width} ${height-bottom} L 0 ${height-bottom} Z`;

  return <div className="dashboard-chart-canvas" aria-label="Revenue trend chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" preserveAspectRatio="none">
      <defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity=".10"/><stop offset="100%" stopColor="#4f46e5" stopOpacity=".015"/></linearGradient></defs>
      {[.25,.5,.75].map((ratio)=><line key={ratio} x1="0" x2={width} y1={(height-bottom)*ratio} y2={(height-bottom)*ratio} className="dashboard-chart-grid"/>)}
      <path d={area} fill="url(#revenue-fill)"/><path d={line} fill="none" className="dashboard-chart-line"/>
      {points.map((point,index)=><circle key={index} cx={point.x} cy={point.y} r="3.2" className="dashboard-chart-point"><title>{labels[index]}: ${values[index].toFixed(2)}</title></circle>)}
    </svg>
    <div className="dashboard-chart-labels">{labels.map((label,index)=><span key={`${label}-${index}`}>{label}</span>)}</div>
  </div>;
}

export function DashboardPage(){
  const {data}=useStore();
  const navigate=useNavigate();
  const [range,setRange]=useState('Last 7 Days');
  const revenue=totalRevenue(data.orders);
  const pending=data.orders.filter((order)=>order.status.toLowerCase()==='pending').length;
  const series=buildPeriodRevenueSeries(data.orders,range);
  const lowStock=data.products.filter((product)=>product.status==='Active'&&product.stock<=12).sort((a,b)=>a.stock-b.stock).slice(0,3);
  const recentOrders=[...data.orders].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,4);
  const productName=(sku:string)=>data.products.find((product)=>product.sku===sku)?.name||sku;
  const completed=data.orders.filter(order=>order.status==='Completed').length;
  const conversion=Math.round((completed/Math.max(1,data.orders.length))*100);

  const kpis=[
    {label:'TOTAL REVENUE',value:`$${revenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,detail:`${completed} completed orders`,icon:<WalletCards/>},
    {label:'TOTAL ORDERS',value:data.orders.length.toLocaleString(),detail:`${conversion}% completed`,icon:<ShoppingBag/>},
    {label:'CUSTOMERS',value:data.customers.length.toLocaleString(),detail:'Active customer records',icon:<Users/>},
    {label:'PENDING ORDERS',value:String(pending),detail:pending?'Requires attention':'All caught up',icon:<TriangleAlert/>,danger:pending>0},
  ];

  return <main className="dashboard-figma">
    <header className="dashboard-header">
      <div><h1>Overview</h1><p>Track your store's performance and recent activities.</p></div>
      <div className="dashboard-header-actions"><DropdownMenu><DropdownMenuTrigger asChild><button><CalendarDays/>{range}<ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuRadioGroup value={range} onValueChange={setRange}>{ranges.map(item=><DropdownMenuRadioItem value={item} key={item}>{item}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu><ExportButton label="Export Report" data={data.orders} filename="commercepro-dashboard-report.csv"/></div>
    </header>

    <section className="dashboard-kpis">{kpis.map((item)=><article key={item.label} className={item.danger?'dashboard-kpi danger':'dashboard-kpi'}><div className="dashboard-kpi-label"><span>{item.label}</span>{item.icon}</div><strong>{item.value}</strong><small>{item.detail}</small></article>)}</section>

    <section className="dashboard-main-row">
      <article className="dashboard-card dashboard-revenue-card"><header><div><h2>Revenue Trend</h2><small>{range}</small></div><button className="bare" aria-label="View reports" onClick={()=>navigate('/reports')}><MoreVertical/></button></header><RevenueChart values={series.map(item=>item.value)} labels={series.map(item=>item.label)}/></article>
      <article className="dashboard-card dashboard-stock-card"><header><h2>Low Stock Alerts</h2><span className="dashboard-alert-count">{lowStock.length}</span></header><div className="dashboard-stock-list">{lowStock.length?lowStock.map((product)=><div className="dashboard-stock-item" key={product.id}><span className="dashboard-stock-icon"><Package/></span><div><strong>{product.name}</strong><small>{product.stock} units left</small></div><button className="bare dashboard-restock" onClick={()=>navigate('/inventory')}>Restock</button></div>):<p className="dashboard-empty-note">No low stock products right now.</p>}</div></article>
    </section>

    <section className="dashboard-card dashboard-orders-card"><header><h2>Recent Orders</h2><button className="bare dashboard-view-all" onClick={()=>navigate('/orders')}>View All</button></header><div className="dashboard-orders-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>PRODUCT</th><th>STATUS</th><th className="number">AMOUNT</th></tr></thead><tbody>{recentOrders.map((order)=><tr key={order.id} onClick={()=>navigate(`/orders/${order.id}`)}><td className="mono">#{order.id}</td><td>{order.customer}</td><td>{productName(order.sku)}</td><td><span className={`status-chip ${order.status.toLowerCase()}`}>{order.status}</span></td><td className="number">${order.total.toFixed(2)}</td></tr>)}</tbody></table></div></section>
  </main>;
}
