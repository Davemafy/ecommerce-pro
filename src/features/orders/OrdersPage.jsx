import { useMemo, useState } from "react";
import { Search, Plus, Filter, Download } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import { orders } from "../../data/mockData";

const tabs=["All Orders","Pending","Processing","Completed"];

export default function OrdersPage() {
 const [query,setQuery]=useState("");
 const [tab,setTab]=useState("All Orders");
 const visibleOrders=useMemo(()=>orders.filter(order=>{
   const matchesTab=tab==="All Orders"||order.fulfillment===tab;
   const haystack=Object.values(order).join(" ").toLowerCase();
   return matchesTab&&haystack.includes(query.trim().toLowerCase());
 }),[query,tab]);

 return <main className="page orders-page">
  <div className="orders-topbar"><h1>Orders</h1><label className="search"><Search/><span className="sr-only">Search orders</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search orders..."/></label><a href="#storefront">View Site ↗</a></div>
  <div className="orders-content"><div className="toolbar"><div className="tabs" role="tablist">{tabs.map(item=><button key={item} role="tab" aria-selected={tab===item} className={tab===item?"tab tab--active":"tab"} onClick={()=>setTab(item)}>{item}</button>)}</div><div className="toolbar-actions"><button><Filter/>Filter</button><button><Download/>Export</button><button className="button-primary"><Plus/>Create Order</button></div></div>
  <section className="card table-card orders-table"><div className="table-scroll"><table><thead><tr><th aria-label="Select">□</th><th>ORDER ID</th><th>CUSTOMER</th><th>DATE</th><th>TOTAL</th><th>PAYMENT</th><th>FULFILLMENT</th></tr></thead><tbody>{visibleOrders.map(o=><tr key={o.id}><td>□</td><td className="accent">{o.id}</td><td><strong>{o.customer}</strong><small>{o.email}</small></td><td>{o.date}</td><td>{o.total}</td><td><StatusBadge>{o.payment}</StatusBadge></td><td><StatusBadge>{o.fulfillment}</StatusBadge></td></tr>)}</tbody></table></div><footer className="pagination"><span>Showing {visibleOrders.length} of 245 results</span><div><button disabled>Previous</button><button>Next</button></div></footer></section></div>
 </main>;
}
