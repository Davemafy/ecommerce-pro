import { ArrowLeft, PackageCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { useStore } from '../../data/store';

export function OrderDetailPage(){
  const navigate=useNavigate(),{orderId}=useParams(),{data}=useStore();
  const order=data.orders.find(o=>o.id===orderId);
  if(!order) return <main><button className="back" onClick={()=>navigate('/orders')}><ArrowLeft/>Orders</button><section className="card empty"><h1>Order not found</h1></section></main>;
  const customer=data.customers.find(c=>c.id===order.customerId),product=data.products.find(p=>p.sku===order.sku);
  return <main><button className="back" onClick={()=>navigate('/orders')}><ArrowLeft/>Orders</button><PageTitle order={order}/><div className="two-column"><section className="card side"><h2>Order items</h2><div className="order-item"><PackageCheck/><div><strong>{product?.name||order.sku}</strong><p>{order.sku} · Qty {order.quantity}</p></div><b>${order.total.toFixed(2)}</b></div></section><section className="card side"><h2>Customer</h2><p><b>{customer?.name||order.customer}</b></p><p>{customer?.email}</p><h2>Order summary</h2><p>Date <b>{new Date(order.date).toLocaleDateString()}</b></p><p>Total <b>${order.total.toFixed(2)}</b></p></section></div></main>;
}
function PageTitle({order}){return <section className="order-detail-title"><div><p>ORDER #{order.id}</p><h1>{order.customer}</h1></div><Badge>{order.status.toUpperCase()}</Badge></section>}
