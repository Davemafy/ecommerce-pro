import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, CircleMinus, Flag } from 'lucide-react';
import { ConfirmDialog, Modal, useToast } from '../../components/ui/feedback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { FormFields } from '../../components/ui/form-fields';
import { ProductVisual } from '../../components/ui/product-visual';
import { useStore } from '../../data/store';
import { buildPeriodRevenueSeries } from '../../utils/analytics';

type ChartRange='30D'|'90D'|'1Y';
const rangeLabel:Record<ChartRange,string>={'30D':'Last 30 Days','90D':'Last 90 Days','1Y':'This Year'};

export function ProductDetailPage() {
  const navigate=useNavigate();
  const {productId}=useParams();
  const {data,updateProduct,archiveProduct}=useStore();
  const product=data.products.find((p)=>p.id===decodeURIComponent(productId||''));
  const [editing,setEditing]=useState(false);
  const [archiving,setArchiving]=useState(false);
  const [range,setRange]=useState<ChartRange>('30D');
  const [form,setForm]=useState<{name?:string;price?:number;stock?:number;category?:string}>({});
  const [error,setError]=useState('');
  const toast=useToast();

  useEffect(()=>{ if(product) setForm({name:product.name,price:product.price,stock:product.stock,category:product.category}); },[product]);
  if(!product) return <main><button className="back" onClick={()=>navigate('/products')}><ArrowLeft/>Products</button><section className="card empty"><h1>Product not found</h1><p>This product may have been removed or the link is no longer valid.</p></section></main>;

  const productOrders=data.orders.filter((order)=>order.sku===product.sku);
  const productRevenue=productOrders.reduce((sum,order)=>sum+order.total,0);
  const capacity=Math.min(100,Math.max(8,Math.round((product.stock/Math.max(50,product.stock))*100)));
  const warehouseA=Math.ceil(product.stock*.35);
  const warehouseB=Math.max(0,product.stock-warehouseA);
  const chart=buildPeriodRevenueSeries(productOrders,rangeLabel[range]);
  const maxChart=Math.max(...chart.map(item=>item.value),1);
  const soldUnits=productOrders.reduce((sum,order)=>sum+order.quantity,0);
  const history=[...productOrders].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map(order=>({date:order.date,action:'Order fulfilled',quantity:-order.quantity,user:'CommercePro',notes:`#${order.id}`}));
  const initialStock=product.stock+soldUnits;

  const save=()=>{
    const price=Number(form.price),stock=Number(form.stock);
    if(!form.name?.trim()||!form.category?.trim()){setError('Name and category are required.');return;}
    if(!Number.isFinite(price)||price<0||!Number.isFinite(stock)||stock<0){setError('Price and stock must be valid non-negative numbers.');return;}
    updateProduct(product.id,{...form,name:form.name.trim(),category:form.category.trim(),price,stock}); setEditing(false);setError('');toast('Product changes saved');
  };

  return <main className="figma-page product-detail-page">
    <div className="product-detail-heading"><div className="product-title"><button className="bare product-back" onClick={()=>navigate('/products')} aria-label="Back to products"><ArrowLeft/></button><h1>{product.name}</h1><span className={`active-badge ${product.status.toLowerCase()}`}>{product.status}</span></div><DropdownMenu><DropdownMenuTrigger asChild><button>Actions <ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setEditing(true)}>Edit product</DropdownMenuItem>{product.status!=='Archived'&&<DropdownMenuItem onSelect={()=>setArchiving(true)}>Archive product</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></div>
    <div className="product-bento"><section className="card product-overview"><div className="keyboard-photo figma-keyboard-photo"><ProductVisual name={product.name} size="lg"/></div><div className="product-copy"><h2>Details</h2><p>{product.description||`${product.name} is available in the CommercePro catalog.`}</p><div className="detail-facts"><div><span>SKU</span><b className="mono">{product.sku}</b></div><div><span>CATEGORY</span><b>{product.category}</b></div><div><span>PRICE</span><strong>${product.price.toFixed(2)}</strong></div><div><span>CURRENT STOCK</span><b><i className="purple-dot"/>{product.stock} units</b></div></div></div></section><div className="product-side-stack"><section className="card inventory-status"><h2>Inventory Status</h2><div className="capacity-label"><b>Fulfillment Capacity</b><span>{capacity}%</span></div><div className="capacity-track"><i style={{width:`${capacity}%`}}/></div><div className="mini-label">Location</div><div className="location-chips"><span>WH-A ({warehouseA})</span><span>WH-B ({warehouseB})</span></div></section><section className="revenue-card"><span>TOTAL REVENUE</span><strong>${productRevenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</strong><p>{productOrders.length} recorded order{productOrders.length===1?'':'s'}</p></section></div></div>
    <section className="card sales-card"><div className="sales-head"><h2>Sales Performance</h2><div>{(['30D','90D','1Y'] as ChartRange[]).map((item)=><button key={item} className={range===item?'selected':''} onClick={()=>setRange(item)}>{item}</button>)}</div></div><div className="sales-chart-area"><div className="y-axis"><span>${maxChart.toFixed(0)}</span><span>${(maxChart*.66).toFixed(0)}</span><span>${(maxChart*.33).toFixed(0)}</span><span>$0</span></div><div className="bars">{chart.map((item,index)=><i key={`${range}-${item.label}-${index}`} style={{height:`${Math.max(4,(item.value/maxChart)*100)}%`,opacity:item.value?0.45+index*.08:.12}} title={`${item.label}: $${item.value.toFixed(2)}`}/>)}</div></div><div className="x-axis">{chart.filter((_,index)=>index===0||index===Math.floor(chart.length/2)||index===chart.length-1).map((item)=><span key={item.label}>{item.label}</span>)}</div></section>
    <section className="card history-card"><h2>Stock History</h2><div className="history-scroll"><table><thead><tr><th>DATE</th><th>ACTION</th><th>QUANTITY</th><th>USER</th><th>NOTES</th></tr></thead><tbody>{history.map((entry)=><tr key={entry.notes}><td>{new Date(entry.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td><td><span className="history-action"><CircleMinus/>{entry.action}</span></td><td className="negative">{entry.quantity}</td><td>{entry.user}</td><td>{entry.notes}</td></tr>)}<tr><td>Catalog start</td><td className="linkish"><span className="history-action"><Flag/>Initial stock</span></td><td><b>+{initialStock}</b></td><td>System</td><td>Product baseline</td></tr></tbody></table></div></section>
    <Modal open={editing} title="Edit product" description="Update the catalog details and stock quantity." onClose={()=>{setEditing(false);setError('')}} footer={<><button onClick={()=>{setEditing(false);setError('')}}>Cancel</button><button className="primary" onClick={save}>Save changes</button></>}><FormFields values={form} onChange={(name,value)=>{setError('');setForm((current)=>({...current,[name]:value}))}} fields={[{name:'name',label:'Product name',required:true},{name:'category',label:'Category',required:true},{name:'price',label:'Price',type:'number',required:true},{name:'stock',label:'Stock quantity',type:'number',required:true}]}/>{error&&<p className="form-error">{error}</p>}</Modal>
    <ConfirmDialog open={archiving} title="Archive this product?" description="It will no longer appear as an active catalog item." confirmLabel="Archive product" danger onClose={()=>setArchiving(false)} onConfirm={()=>{archiveProduct(product.id);setArchiving(false);toast('Product archived')}}/>
  </main>;
}
