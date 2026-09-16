import { ChevronDown, CreditCard, History, Package, Truck, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../data/store';
import { useToast } from '../../components/ui/feedback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import adminPfp from '../../assets/admin-pfp.png';

export function OrderDetailPage(){
  const navigate=useNavigate();
  const {orderId}=useParams();
  const {data}=useStore();
  const toast=useToast();
  const order=data.orders.find((item)=>item.id===orderId);

  if(!order) return <main className="figma-page"><button className="back" onClick={()=>navigate('/orders')}>← Orders</button><section className="card empty"><h1>Order not found</h1></section></main>;

  const customer=data.customers.find((item)=>item.id===order.customerId);
  const product=data.products.find((item)=>item.sku===order.sku);
  const placedDate=new Date(order.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const status=order.status;
  const activityTitle=status==='Completed'?'Order Completed':status==='Pending'?'Order Pending':'Order Processing';
  const activityDescription=status==='Completed'?'Order was fulfilled successfully.':status==='Pending'?'Order is waiting for processing.':'Warehouse is preparing the order.';

  return <main className="order-detail-figma">
    <header className="order-detail-header">
      <div>
        <div className="order-breadcrumb"><button className="bare" onClick={()=>navigate('/orders')}>Orders</button><span>›</span><span>#{order.id.replace('ORD-','')}</span></div>
        <h1>Order #{order.id.replace('ORD-','')}</h1>
        <p>Placed on {placedDate}</p>
      </div>
      <div className="order-detail-header-actions"><span className={`status-chip order-status ${status.toLowerCase()}`}><i/>{status}</span><DropdownMenu><DropdownMenuTrigger asChild><button>Actions <ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>toast('Order receipt ready to print')}>Print order</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast('Order status action saved')}>Update status</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast('Customer notification queued')}>Notify customer</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    </header>

    <div className="order-detail-grid">
      <div className="order-detail-main">
        <section className="order-panel order-products-panel">
          <header><h2>Purchased Products</h2></header>
          <div className="order-products-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th className="number">QTY</th><th className="number">PRICE</th><th className="number">TOTAL</th></tr></thead><tbody><tr><td><div className="order-product-cell"><span className="order-product-thumb"><Package/></span><div><strong>{product?.name||order.sku}</strong><small>{product?.category||'Product'}</small></div></div></td><td className="mono">{order.sku}</td><td className="number">{order.quantity}</td><td className="number">${((product?.price||order.total/Math.max(1,order.quantity))).toFixed(2)}</td><td className="number strong">${order.total.toFixed(2)}</td></tr></tbody></table></div>
        </section>

        <section className="order-panel order-payment-panel">
          <h2>Payment Summary</h2>
          <div className="order-payment-grid"><div className="order-totals"><div><span>Subtotal</span><b>${order.total.toFixed(2)}</b></div><div><span>Shipping (Standard)</span><b>$0.00</b></div><div><span>Tax</span><b>$0.00</b></div><div className="order-total"><strong>Total</strong><strong>${order.total.toFixed(2)}</strong></div></div><div className="order-payment-method"><CreditCard/><div><strong>Paid via Credit Card</strong><p>Card payment</p><small>Transaction ID: txn_{order.id.toLowerCase().replace(/-/g,'')}</small></div></div></div>
        </section>
      </div>

      <aside className="order-detail-side">
        <section className="order-panel order-customer-panel"><h2><UserRound/>Customer Info</h2><div className="order-customer-person"><img src={adminPfp} alt=""/><div><strong>{customer?.name||order.customer}</strong><button className="bare" onClick={()=>customer&&navigate(`/customers/${customer.id}`)}>{customer?.email||'Customer profile'}</button></div></div><div className="order-side-field"><span>PHONE</span><p>{customer?.phone||'Not provided'}</p></div></section>

        <section className="order-panel order-shipping-panel"><h2><Truck/>Shipping Details</h2><div className="order-side-field"><span>SHIPPING ADDRESS</span><p>{customer?.name||order.customer}<br/>{customer?.address||'Address not provided'}</p></div><div className="order-side-field divided"><span>SHIPPING METHOD</span><p>Standard Shipping (3-5 Business Days)</p><button className="bare order-track-link" onClick={()=>toast('Tracking information opened')}>Track Package</button></div></section>

        <section className="order-panel order-activity-panel"><h2><History/>Activity Log</h2><div className="order-timeline"><div className="active"><i/><strong>{activityTitle}</strong><p>{activityDescription}</p><small>{placedDate}</small></div><div><i/><strong>Payment Confirmed</strong><p>Payment recorded for this order.</p><small>{placedDate}</small></div><div><i/><strong>Order Placed</strong><p>Order #{order.id.replace('ORD-','')} created for {customer?.name||order.customer}.</p><small>{placedDate}</small></div></div></section>
      </aside>
    </div>
  </main>;
}
