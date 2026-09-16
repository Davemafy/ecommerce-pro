import { useMemo, useState } from 'react';
import { Filter, MoreVertical, Search, ShoppingCart } from 'lucide-react';
import { ExportButton } from '../../components/ui/export-button';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

const PAGE_SIZE=5;

export function InventoryPage(){
 const {data,adjustInventory}=useStore(),toast=useToast();
 const [query,setQuery]=useState('');
 const [lowOnly,setLowOnly]=useState(false);
 const [page,setPage]=useState(1);
 const [adjusting,setAdjusting]=useState(false);
 const [form,setForm]=useState({sku:'',quantity:'',reason:''});
 const [error,setError]=useState('');

 const rows=useMemo(()=>data.products.filter(p=>{
   const matches=`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase());
   return matches&&(!lowOnly||p.stock<=12);
 }),[data.products,query,lowOnly]);
 const pageCount=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
 const currentPage=Math.min(page,pageCount);
 const visibleRows=rows.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
 const totalUnits=data.products.reduce((sum,p)=>sum+p.stock,0);
 const lowStockCount=data.products.filter(p=>p.stock<=12).length;
 const totalValue=data.products.reduce((sum,p)=>sum+(p.price*p.stock),0);
 const start=rows.length?(currentPage-1)*PAGE_SIZE+1:0;
 const end=Math.min(currentPage*PAGE_SIZE,rows.length);

 const openAdjustment=(sku:string)=>{setForm({sku,quantity:'',reason:''});setError('');setAdjusting(true)};
 const apply=()=>{if(!data.products.some(p=>p.sku===form.sku)){setError('Enter a valid product SKU.');return;} if(!Number(form.quantity)){setError('Enter a non-zero quantity adjustment.');return;} adjustInventory(form.sku,Number(form.quantity));setAdjusting(false);setForm({sku:'',quantity:'',reason:''});setError('');toast('Inventory updated');};

 return <main className="figma-page inventory-figma">
   <div className="figma-page-heading"><div><h1>Inventory Management</h1><p>Manage stock levels, locations, and reorder points.</p></div><div className="page-actions"><button className={lowOnly?'inventory-filter-active':''} onClick={()=>{setLowOnly(value=>!value);setPage(1)}}><Filter/>{lowOnly?'Show All':'Low Stock'}</button><ExportButton data={rows} filename="commercepro-inventory.csv"/></div></div>
   <div className="inventory-kpis"><article><span>TOTAL UNITS</span><strong>{totalUnits.toLocaleString()}</strong></article><article><span>LOW STOCK ALERTS</span><strong className={lowStockCount?'danger':''}>{lowStockCount}</strong></article><article><span>INVENTORY VALUE</span><strong>${totalValue.toLocaleString(undefined,{maximumFractionDigits:0})}</strong></article><article><span>ACTIVE WAREHOUSES</span><strong>2</strong></article></div>
   <section className="inventory-controls"><label className="figma-search"><Search/><input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1)}} placeholder="Search product, SKU, or category"/></label><span>{lowOnly?'Showing products at or below 12 units':'All inventory locations'}</span></section>
   <section className="figma-table-card"><table className="figma-table inventory-table"><thead><tr><th>PRODUCT NAME</th><th>SKU</th><th>CATEGORY</th><th>LOCATION</th><th className="number">CURRENT STOCK</th><th className="number">REORDER POINT</th><th>STATUS</th><th className="action-column">ACTIONS</th></tr></thead><tbody>
   {visibleRows.map((p,i)=>{const critical=p.stock<=3,lowStock=p.stock<=12;return <tr key={p.id} className={lowStock?'inventory-alert-row':''}><td className={lowStock?'danger':''}><strong>{p.name}</strong></td><td className="mono">{p.sku}</td><td>{p.category}</td><td>{((currentPage-1)*PAGE_SIZE+i)%2?'WH-B, Rack 2':'WH-A, Aisle 4'}</td><td className={`number ${lowStock?'danger':''}`}><b>{p.stock}</b></td><td className="number">{critical?15:Math.max(20,Math.round(p.stock*.35))}</td><td><span className={`inventory-status-chip ${critical?'critical':lowStock?'low':'ok'}`}>{critical?'Critical':lowStock?'Low Stock':'In Stock'}</span></td><td className="action-column"><button className="bare inventory-action" title="Adjust inventory" aria-label={`Adjust ${p.name} inventory`} onClick={()=>openAdjustment(p.sku)}>{lowStock?<ShoppingCart/>:<MoreVertical/>}</button></td></tr>})}
   {!visibleRows.length&&<tr><td colSpan={8}><div className="table-empty-state"><strong>No inventory matches these filters.</strong><span>Try another search or show all inventory.</span></div></td></tr>}
   </tbody></table><footer className="table-footer"><strong>Showing {start} to {end} of {rows.length} products</strong><div><button disabled={currentPage<=1} onClick={()=>setPage(value=>Math.max(1,value-1))}>‹</button><span className="pagination-summary">Page {currentPage} of {pageCount}</span><button disabled={currentPage>=pageCount} onClick={()=>setPage(value=>Math.min(pageCount,value+1))}>›</button></div></footer></section>
   <Modal open={adjusting} title="Adjust inventory" description="Record a stock correction with an optional reason." onClose={()=>setAdjusting(false)} footer={<><button onClick={()=>setAdjusting(false)}>Cancel</button><button className="primary" onClick={apply}>Apply adjustment</button></>}><FormFields values={form} onChange={(n,v)=>setForm(x=>({...x,[n]:v}))} fields={[{name:'sku',label:'Product SKU'},{name:'quantity',label:'Quantity adjustment',type:'number'},{name:'reason',label:'Reason'}]}/>{error&&<p className="form-error">{error}</p>}</Modal>
 </main>;
}