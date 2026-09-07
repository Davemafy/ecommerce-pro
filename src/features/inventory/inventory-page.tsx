import { useMemo, useState } from 'react';
import { Filter, MoreVertical, Search, ShoppingCart } from 'lucide-react';
import { ExportButton } from '../../components/ui/export-button';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

export function InventoryPage(){
 const {data,adjustInventory}=useStore(),toast=useToast();
 const [query,setQuery]=useState(''),[adjusting,setAdjusting]=useState(false),[form,setForm]=useState({sku:'',quantity:'',reason:''}),[error,setError]=useState('');
 const rows=useMemo(()=>data.products.filter(p=>`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(query.toLowerCase())),[data.products,query]);
 const apply=()=>{if(!data.products.some(p=>p.sku===form.sku)){setError('Enter a valid product SKU.');return;} if(!Number(form.quantity)){setError('Enter a non-zero quantity adjustment.');return;} adjustInventory(form.sku,Number(form.quantity));setAdjusting(false);setForm({sku:'',quantity:'',reason:''});setError('');toast('Inventory updated');};
 return <main className="figma-page inventory-figma">
   <div className="figma-page-heading"><div><h1>Inventory Management</h1><p>Manage stock levels, locations, and reorder points.</p></div><div className="page-actions"><button><Filter/>Filter</button><ExportButton/></div></div>
   <div className="inventory-kpis"><article><span>TOTAL ITEMS</span><strong>12,450</strong></article><article><span>LOW STOCK ALERTS</span><strong className="danger">24 ⚠</strong></article><article><span>TOTAL VALUE</span><strong>$1.2M</strong></article><article><span>ACTIVE WAREHOUSES</span><strong>4</strong></article></div>
   <section className="figma-table-card"><table className="figma-table inventory-table"><thead><tr><th>PRODUCT NAME</th><th>SKU</th><th>CATEGORY</th><th>LOCATION</th><th className="number">CURRENT STOCK</th><th className="number">REORDER POINT</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
   {rows.slice(0,5).map((p,i)=>{const critical=p.stock<=3,lowStock=p.stock<=12;return <tr key={p.id} className={lowStock?'inventory-alert-row':''}><td className={lowStock?'danger':''}><strong>{p.name}</strong></td><td className="mono">{p.sku}</td><td>{p.category}</td><td>{i%2?'WH-B, Rack 2':'WH-A, Aisle 4'}</td><td className={`number ${lowStock?'danger':''}`}><b>{p.stock}</b></td><td className="number">{critical?15:Math.max(20,Math.round(p.stock*.35))}</td><td><span className={`inventory-status-chip ${critical?'critical':lowStock?'low':'ok'}`}>{critical?'Critical':lowStock?'Low Stock':'In Stock'}</span></td><td><button className="bare inventory-action" onClick={()=>{if(lowStock){setForm(x=>({...x,sku:p.sku}));setAdjusting(true)}}}>{lowStock?<ShoppingCart/>:<MoreVertical/>}</button></td></tr>})}
   </tbody></table><footer className="table-footer"><strong>Showing 1 to {Math.min(5,rows.length)} of 12,450 results</strong><div><button disabled>‹</button><button className="pagination-active">1</button><button>2</button><button>3</button><span>…</span><button>›</button></div></footer></section>
   <Modal open={adjusting} title="Adjust inventory" description="Record a stock correction." onClose={()=>setAdjusting(false)} footer={<><button onClick={()=>setAdjusting(false)}>Cancel</button><button className="primary" onClick={apply}>Apply adjustment</button></>}><FormFields values={form} onChange={(n,v)=>setForm(x=>({...x,[n]:v}))} fields={[{name:'sku',label:'Product SKU'},{name:'quantity',label:'Quantity adjustment',type:'number'},{name:'reason',label:'Reason'}]}/>{error&&<p className="form-error">{error}</p>}</Modal>
 </main>;
}