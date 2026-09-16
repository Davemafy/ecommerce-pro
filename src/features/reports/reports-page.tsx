import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExportButton } from '../../components/ui/export-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useStore } from '../../data/store';
import { averageOrderValue, buildPeriodRevenueSeries, totalRevenue } from '../../utils/analytics';

const ranges=['Last 7 Days','Last 30 Days','Last 90 Days','This Year'];

export function ReportsPage(){
 const {data}=useStore();
 const navigate=useNavigate();
 const [range,setRange]=useState('Last 30 Days');
 const revenue=totalRevenue(data.orders);
 const aov=averageOrderValue(data.orders);
 const chart=buildPeriodRevenueSeries(data.orders,range);
 const maxValue=Math.max(...chart.map(item=>item.value),1);
 const categoryRows=useMemo(()=>{
   const totals=new Map<string,number>();
   data.orders.forEach(order=>{
     const product=data.products.find(item=>item.sku===order.sku);
     const category=product?.category||'Other';
     totals.set(category,(totals.get(category)||0)+order.total);
   });
   return [...totals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);
 },[data.orders,data.products]);

 return <main className="figma-page reports-figma">
   <div className="figma-page-heading reports-heading"><div><h1>Analytics Overview</h1><p>Track your key performance indicators and revenue trends.</p></div><div className="page-actions"><DropdownMenu><DropdownMenuTrigger asChild><button><CalendarDays/>{range}<ChevronDown className="button-chevron"/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuRadioGroup value={range} onValueChange={setRange}>{ranges.map(item=><DropdownMenuRadioItem value={item} key={item}>{item}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu><ExportButton data={data.orders} filename="commercepro-report.csv"/></div></div>
   <div className="report-kpis"><article><span>TOTAL SALES</span><strong>${revenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><small className="up">{data.orders.length} orders</small><em>recorded</em></article><article><span>ORDER VOLUME</span><strong>{data.orders.length.toLocaleString()}</strong><small className="up">Live</small><em>current dataset</em></article><article><span>AVG ORDER VALUE</span><strong>${aov.toFixed(2)}</strong><small className="up">Calculated</small><em>from recorded orders</em></article></div>
   <div className="reports-grid"><section className="card monthly-card"><div className="section-title"><div><h2>Revenue Trend</h2><span className="section-kicker">{range}</span></div></div><div className="monthly-chart"><div className="report-y"><span>${maxValue.toFixed(0)}</span><span>${(maxValue*.75).toFixed(0)}</span><span>${(maxValue*.5).toFixed(0)}</span><span>${(maxValue*.25).toFixed(0)}</span><span>$0</span></div><div className="report-bars">{chart.map((item,index)=><div key={`${range}-${item.label}-${index}`}><i className={index===chart.length-1?'current':''} style={{height:`${Math.max(8,(item.value/maxValue)*210)}px`}} title={`${item.label}: $${item.value.toFixed(2)}`}/><span className={index===chart.length-1?'current-label':''}>{item.label}</span></div>)}</div></div></section>
   <section className="card categories-card"><div className="section-title"><h2>Top Categories</h2><button className="bare linkish" onClick={()=>navigate('/products')}>View Products</button></div>{categoryRows.length?<table><thead><tr><th>CATEGORY</th><th>REVENUE</th><th>SHARE</th></tr></thead><tbody>{categoryRows.map(([category,total])=><tr key={category}><td><span className="category-icon">{category.slice(0,1).toUpperCase()}</span>{category}</td><td className="mono">${total.toFixed(2)}</td><td className="positive">{revenue?Math.round(total/revenue*100):0}%</td></tr>)}</tbody></table>:<div className="report-empty-state">Category revenue appears once orders are recorded.</div>}</section></div>
 </main>;
}
