import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, CircleMinus, CirclePlus, Flag } from 'lucide-react';
import { ConfirmDialog, Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

const productImage='https://www.figma.com/api/mcp/asset/bf61aa1f-c41c-4818-b87e-314a72a291ac.png';
const chartSeries={
  '30D':[30,45,25,65,55,85,100,75,45,60],
  '90D':[44,58,40,69,61,78,91,82,67,74],
  '1Y':[38,52,48,62,57,72,88,79,70,84],
} as const;

type ChartRange=keyof typeof chartSeries;

export function ProductDetailPage() {
  const navigate=useNavigate();
  const {productId}=useParams();
  const {data,updateProduct,archiveProduct}=useStore();
  const product=data.products.find((p)=>p.id===decodeURIComponent(productId||''));
  const [editing,setEditing]=useState(false);
  const [archiving,setArchiving]=useState(false);
  const [actionsOpen,setActionsOpen]=useState(false);
  const [range,setRange]=useState<ChartRange>('30D');
  const [form,setForm]=useState<{name?:string;price?:number;stock?:number;category?:string}>({});
  const toast=useToast();

  useEffect(()=>{ if(product) setForm({name:product.name,price:product.price,stock:product.stock,category:product.category}); },[product]);
  if(!product) return <main><button className="back" onClick={()=>navigate('/products')}><ArrowLeft/>Products</button><section className="card empty"><h1>Product not found</h1><p>This product may have been removed or the link is no longer valid.</p></section></main>;

  const productRevenue=data.orders.filter((order)=>order.sku===product.sku).reduce((sum,order)=>sum+order.total,0);
  const capacity=Math.min(100,Math.max(8,Math.round((product.stock/Math.max(50,product.stock))*100)));
  const warehouseA=Math.ceil(product.stock*.35);
  const warehouseB=Math.max(0,product.stock-warehouseA);
  const save=()=>{ updateProduct(product.id,{...form,price:Number(form.price),stock:Number(form.stock)}); setEditing(false); toast('Product changes saved'); };

  return <main className="figma-page product-detail-page">
    <div className="product-detail-heading">
      <div className="product-title"><button className="bare product-back" onClick={()=>navigate('/products')} aria-label="Back to products"><ArrowLeft/></button><h1>{product.name}</h1><span className={`active-badge ${product.status.toLowerCase()}`}>{product.status}</span></div>
      <div className="action-menu-wrap"><button onClick={()=>setActionsOpen((value)=>!value)}>Actions <ChevronDown/></button>{actionsOpen&&<div className="action-menu"><button onClick={()=>{setActionsOpen(false);setEditing(true)}}>Edit product</button>{product.status!=='Archived'&&<button onClick={()=>{setActionsOpen(false);setArchiving(true)}}>Archive product</button>}</div>}</div>
    </div>

    <div className="product-bento">
      <section className="card product-overview">
        <div className="keyboard-photo figma-keyboard-photo"><img src={productImage} alt={`${product.name} product`} /></div>
        <div className="product-copy"><h2>Details</h2><p>{product.description||'Premium mechanical keyboard designed for professionals. Features hot-swappable switches, aluminum body, and multi-device bluetooth connectivity.'}</p><div className="detail-facts"><div><span>SKU</span><b className="mono">{product.sku}</b></div><div><span>CATEGORY</span><b>{product.category}</b></div><div><span>PRICE</span><strong>${product.price.toFixed(2)}</strong></div><div><span>CURRENT STOCK</span><b><i className="purple-dot"/>{product.stock} units</b></div></div></div>
      </section>
      <div className="product-side-stack">
        <section className="card inventory-status"><h2>Inventory Status</h2><div className="capacity-label"><b>Fulfillment Capacity</b><span>{capacity}%</span></div><div className="capacity-track"><i style={{width:`${capacity}%`}}/></div><div className="mini-label">Location</div><div className="location-chips"><span>WH-A ({warehouseA})</span><span>WH-B ({warehouseB})</span></div></section>
        <section className="revenue-card"><span>TOTAL REVENUE</span><strong>${productRevenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><p>↗ Recorded product sales</p></section>
      </div>
    </div>

    <section className="card sales-card">
      <div className="sales-head"><h2>Sales Performance</h2><div>{(['30D','90D','1Y'] as ChartRange[]).map((item)=><button key={item} className={range===item?'selected':''} onClick={()=>setRange(item)}>{item}</button>)}</div></div>
      <div className="sales-chart-area"><div className="y-axis"><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bars">{chartSeries[range].map((height,index)=><i key={`${range}-${index}`} style={{height:`${height}%`,opacity:.2+index*.075}} title={`${Math.round(height*1.5)} units`}/>)}</div></div>
      <div className="x-axis"><span>Oct 1</span><span>Oct 8</span><span>Oct 15</span><span>Oct 22</span><span>Oct 30</span></div>
    </section>

    <section className="card history-card"><h2>Stock History</h2><div className="history-scroll"><table><thead><tr><th>DATE</th><th>ACTION</th><th>QUANTITY</th><th>USER</th><th>NOTES</th></tr></thead><tbody><tr><td>Oct 28, 2023</td><td className="linkish"><span className="history-action"><CirclePlus/>Restock</span></td><td><b>+100</b></td><td>Admin User</td><td>PO-2023-45</td></tr><tr><td>Oct 25, 2023</td><td><span className="history-action"><CircleMinus/>Manual Adjustment</span></td><td className="negative">-2</td><td>Sarah Jenkins</td><td>Damaged in transit</td></tr><tr><td>Oct 15, 2023</td><td className="linkish"><span className="history-action"><CirclePlus/>Restock</span></td><td><b>+250</b></td><td>Admin User</td><td>PO-2023-42</td></tr><tr><td>Sep 01, 2023</td><td className="linkish"><span className="history-action"><Flag/>Initial Stock</span></td><td><b>+500</b></td><td>System</td><td>Product launch</td></tr></tbody></table></div></section>

    <Modal open={editing} title="Edit product" onClose={()=>setEditing(false)} footer={<><button onClick={()=>setEditing(false)}>Cancel</button><button className="primary" onClick={save}>Save changes</button></>}>
      <FormFields values={form} onChange={(name,value)=>setForm((current)=>({...current,[name]:value}))} fields={[{name:'name',label:'Product name'},{name:'category',label:'Category'},{name:'price',label:'Price',type:'number'},{name:'stock',label:'Stock quantity',type:'number'}]}/>
    </Modal>
    <ConfirmDialog open={archiving} title="Archive this product?" description="It will no longer appear as an active catalog item." confirmLabel="Archive product" danger onClose={()=>setArchiving(false)} onConfirm={()=>{archiveProduct(product.id);setArchiving(false);toast('Product archived')}}/>
  </main>;
}
