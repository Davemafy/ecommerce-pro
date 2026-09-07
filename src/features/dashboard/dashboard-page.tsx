import { ExportButton } from '../../components/ui/export-button';
import { PageHeader } from '../../components/ui/page-header';
import { SummaryCards } from '../../components/ui/summary-cards';
import { useStore } from '../../data/store';

export function DashboardPage(){
 const {data}=useStore(); const revenue=data.orders.reduce((a,o)=>a+o.total,0), pending=data.orders.filter(o=>o.status==='Pending').length;
 const values=data.orders.slice(0,8).reverse().map(o=>o.total); const max=Math.max(...values,1);
 return <main><PageHeader title="Overview" subtitle="A snapshot of your store performance."><ExportButton label="Export Report"/></PageHeader>
 <SummaryCards items={[['TOTAL REVENUE',`$${revenue.toFixed(2)}`,'Recorded orders'],['TOTAL ORDERS',String(data.orders.length),'All orders'],['CUSTOMERS',String(data.customers.length),'Customer accounts'],['PENDING ORDERS',String(pending),'Requires attention']]}/>
 <section className="card chart-card"><h2>Revenue Trend</h2><div className="real-bar-chart">{values.map((v,i)=><div key={i} className="real-bar-column"><i style={{height:`${Math.max(8,v/max*150)}px`}}/><span>${Math.round(v)}</span></div>)}</div></section></main>;
}
