import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { ConfirmDialog, Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

export function ProductDetailPage() {
  const navigate=useNavigate(); const {productId}=useParams();
  const {data,updateProduct,archiveProduct}=useStore();
  const product=data.products.find((p)=>p.id===decodeURIComponent(productId));
  const [editing,setEditing]=useState(false),[archiving,setArchiving]=useState(false),[actionsOpen,setActionsOpen]=useState(false);
  const [form,setForm]=useState({}); const toast=useToast();
  useEffect(()=>{ if(product) setForm({name:product.name,price:product.price,stock:product.stock,category:product.category}); },[product]);
  if(!product) return <main><button className="back" onClick={()=>navigate('/products')}><ArrowLeft/>Products</button><section className="card empty"><h1>Product not found</h1><p>This product may have been removed or the link is no longer valid.</p></section></main>;
  const save=()=>{ updateProduct(product.id,{...form,price:Number(form.price),stock:Number(form.stock)}); setEditing(false); toast('Product changes saved'); };
  return <main className="figma-page product-detail-page">
    <div className="product-detail-heading"><div className="product-title"><button className="bare" onClick={()=>navigate('/products')}><ArrowLeft/></button><h1>{product.name}</h1><span className="active-badge">{product.status}</span></div>
      <div className="action-menu-wrap"><button onClick={()=>setActionsOpen((v)=>!v)}>Actions <ChevronDown/></button>{actionsOpen&&<div className="action-menu"><button onClick={()=>{setActionsOpen(false);setEditing(true)}}>Edit product</button>{product.status!=='Archived'&&<button onClick={()=>{setActionsOpen(false);setArchiving(true)}}>Archive product</button>}</div>}</div></div>
    <div className="product-bento">
      <section className="card product-overview">
        <div className="keyboard-photo figma-keyboard-photo"><img src="https://www.figma.com/api/mcp/asset/99cb3065-96ad-40da-8583-09f26a02937e.png" alt="" /></div>
        <div className="product-copy"><h2>Details</h2><p>{product.description||'Premium mechanical keyboard designed for professionals. Features hot-swappable switches, aluminum body, and multi-device bluetooth connectivity.'}</p><div className="detail-facts"><div><span>SKU</span><b className="mono">{product.sku}</b></div><div><span>CATEGORY</span><b>{product.category}</b></div><div><span>PRICE</span><strong>${product.price.toFixed(2)}</strong></div><div><span>CURRENT STOCK</span><b><i className="purple-dot"/>{product.stock} units</b></div></div></div>
      </section>
      <div className="product-side-stack">
        <section className="card inventory-status"><h2>Inventory Status</h2><div className="capacity-label"><b>Fulfillment Capacity</b><span>85%</span></div><div className="capacity-track"><i style={{width:'85%'}}/></div><div className="mini-label">Location</div><div className="location-chips"><span>WH-A (120)</span><span>WH-B (222)</span></div></section>
        <section className="revenue-card"><span>TOTAL REVENUE</span><strong>$50,958</strong><p>↗ +12.5% this month</p></section>
      </div>
    </div>
    <section className="card sales-card"><div className="sales-head"><h2>Sales Performance</h2><div><button className="selected">30D</button><button>90D</button><button>1Y</button></div></div><div className="bar-chart"><div className="y-axis"><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bars">{[30,45,25,65,55,85,100,75,45,60].map((h,i)=><i key={i} style={{height:`${h}%`,opacity:.22+i*.07}}/>)}</div></div><div className="x-axis"><span>Oct 1</span><span>Oct 8</span><span>Oct 15</span><span>Oct 22</span><span>Oct 30</span></div></section>
    <section className="card history-card"><h2>Stock History</h2><table><thead><tr><th>DATE</th><th>ACTION</th><th>QUANTITY</th><th>USER</th><th>NOTES</th></tr></thead><tbody><tr><td>Oct 28, 2023</td><td className="linkish">⊕ Restock</td><td><b>+100</b></td><td>Admin User</td><td>PO-2023-45</td></tr><tr><td>Oct 25, 2023</td><td>⊖ Manual Adjustment</td><td className="negative">-2</td><td>Sarah Jenkins</td><td>Damaged in transit</td></tr><tr><td>Oct 15, 2023</td><td className="linkish">⊕ Restock</td><td><b>+250</b></td><td>Admin User</td><td>PO-2023-42</td></tr><tr><td>Sep 01, 2023</td><td className="linkish">⚑ Initial Stock</td><td><b>+500</b></td><td>System</td><td>Product launch</td></tr></tbody></table></section>
    <Modal open={editing} title="Edit product" onClose={()=>setEditing(false)} footer={<><button onClick={()=>setEditing(false)}>Cancel</button><button className="primary" onClick={save}>Save changes</button></>}>
      <FormFields values={form} onChange={(n,v)=>setForm((x)=>({...x,[n]:v}))} fields={[{name:'name',label:'Product name'},{name:'category',label:'Category'},{name:'price',label:'Price',type:'number'},{name:'stock',label:'Stock quantity',type:'number'}]}/>
    </Modal>
    <ConfirmDialog open={archiving} title="Archive this product?" description="It will no longer appear as an active catalog item." confirmLabel="Archive product" danger onClose={()=>setArchiving(false)} onConfirm={()=>{archiveProduct(product.id);setArchiving(false);toast('Product archived')}}/>
  </main>;
}
