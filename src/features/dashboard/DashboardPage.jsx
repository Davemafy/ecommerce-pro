import { CalendarDays, Headphones, Mouse, Keyboard, MoreVertical } from "lucide-react";
import KpiCard from "./KpiCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { recentOrders } from "../../data/mockData";

const stock=[[Headphones,"Wireless Earbuds","2 units left"],[Mouse,"Ergonomic Mouse","5 units left"],[Keyboard,"Mechanical Keyboard","8 units left"]];

export default function DashboardPage({onNavigate}) {
 return <main className="page dashboard-page">
  <header className="page-header"><div><h1>Overview</h1><p>Track your store's performance and recent activities.</p></div><div className="page-actions"><button><CalendarDays/>Last 7 Days</button><button className="button-primary">Export Report</button></div></header>
  <section className="kpi-grid"><KpiCard label="TOTAL REVENUE" value="$124,000" change="+12% from last week" icon="revenue"/><KpiCard label="TOTAL ORDERS" value="1,200" change="+5% from last week" icon="orders"/><KpiCard label="NEW CUSTOMERS" value="850" change="+8% from last week" icon="customers"/><KpiCard label="PENDING ORDERS" value="42" attention/></section>
  <section className="dashboard-grid">
   <article className="card revenue-card"><div className="card-heading"><h2>Revenue Trend</h2><button className="icon-button" aria-label="Revenue chart options"><MoreVertical/></button></div><div className="figma-chart"><svg viewBox="0 0 620 190" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3525cd" stopOpacity=".10"/><stop offset="1" stopColor="#3525cd" stopOpacity=".02"/></linearGradient></defs><path className="area" d="M0 150 L92 169 L184 105 L276 125 L368 65 L460 88 L552 44 L620 58 L620 190 L0 190 Z"/><polyline points="0,150 92,169 184,105 276,125 368,65 460,88 552,44 620,58"/></svg></div></article>
   <article className="card stock-card"><div className="card-heading"><h2>Low Stock Alerts</h2><span className="count">3</span></div><div className="stock-list">{stock.map(([Icon,name,quantity])=><div className="stock-row" key={name}><span className="stock-icon"><Icon/></span><div>{name}<small>{quantity}</small></div><button>Restock</button></div>)}</div></article>
  </section>
  <section className="card table-card recent-orders"><div className="card-heading table-heading"><h2>Recent Orders</h2><button className="link-button" onClick={()=>onNavigate("Orders")}>View All</button></div><div className="table-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>PRODUCT</th><th>STATUS</th><th>AMOUNT</th></tr></thead><tbody>{recentOrders.map(o=><tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.product}</td><td><StatusBadge>{o.status}</StatusBadge></td><td>{o.amount}</td></tr>)}</tbody></table></div></section>
 </main>;
}
