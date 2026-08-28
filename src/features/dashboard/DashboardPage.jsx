import { CalendarDays, Headphones, Mouse, Keyboard } from "lucide-react";
import KpiCard from "./KpiCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { recentOrders } from "../../data/mockData";

const stock = [[Headphones,"Wireless Earbuds","2 units left"],[Mouse,"Ergonomic Mouse","5 units left"],[Keyboard,"Mechanical Keyboard","8 units left"]];

export default function DashboardPage({onNavigate}) {
 return <main className="page">
  <header className="page-header"><div><h1>Overview</h1><p>Track your store's performance and recent activities.</p></div><div className="page-actions"><button><CalendarDays/>Last 7 Days</button><button className="button-primary">Export Report</button></div></header>
  <section className="kpi-grid" aria-label="Store performance"><KpiCard label="TOTAL REVENUE" value="$124,000"/><KpiCard label="TOTAL ORDERS" value="1,200"/><KpiCard label="NEW CUSTOMERS" value="850"/><KpiCard label="PENDING ORDERS" value="42" attention/></section>
  <section className="dashboard-grid"><article className="card"><h2>Revenue Trend</h2><div className="chart" aria-label="Revenue trend chart"><svg viewBox="0 0 600 180" preserveAspectRatio="none"><polyline points="0,145 90,165 180,105 270,125 360,65 450,90 540,45 600,60"/></svg></div></article>
  <article className="card"><div className="card-heading"><h2>Low Stock Alerts</h2><span className="count">3</span></div>{stock.map(([Icon,name,quantity])=><div className="stock-row" key={name}><span className="stock-icon"><Icon/></span><div>{name}<small>{quantity}</small></div><button>Restock</button></div>)}</article></section>
  <section className="card table-card"><div className="card-heading table-heading"><h2>Recent Orders</h2><button className="link-button" onClick={()=>onNavigate("Orders")}>View All</button></div><div className="table-scroll"><table><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>PRODUCT</th><th>STATUS</th><th>AMOUNT</th></tr></thead><tbody>{recentOrders.map(o=><tr key={o.id}><td className="accent">{o.id}</td><td>{o.customer}</td><td>{o.product}</td><td><StatusBadge>{o.status}</StatusBadge></td><td>{o.amount}</td></tr>)}</tbody></table></div></section>
 </main>;
}
