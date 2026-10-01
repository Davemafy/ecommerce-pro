import { useQuery } from '@tanstack/react-query';
import { ChevronDown, CreditCard, History, Package, Truck, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../data/store';
import { commerceService } from '../../services/commerce-service';
import { useToast } from '../../components/ui/feedback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const titleCase = (value = '') => value.split('_').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

function addressText(address: any) {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.street || address.address1 || address.line1, address.city, address.state || address.region, address.postalCode || address.zip, address.country].filter(Boolean).join(', ');
}

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const routeId = decodeURIComponent(orderId || '');
  const { data, updateOrderStatus, isSaving } = useStore();
  const toast = useToast();
  const listOrder = data.orders.find((item: any) => item.id === routeId || item.apiId === routeId);
  const apiId = listOrder?.apiId || routeId;

  const orderQuery = useQuery({
    queryKey: ['order', apiId],
    queryFn: () => commerceService.getOrderDetail(apiId),
    enabled: Boolean(apiId),
    staleTime: 30_000,
    retry: 1,
  });

  const order: any = orderQuery.data || listOrder;

  if (!order && orderQuery.isLoading) {
    return <main className="figma-page"><section className="card empty"><h1>Loading order…</h1><p>Fetching the latest order details.</p></section></main>;
  }

  if (!order) {
    return <main className="figma-page"><button className="back" onClick={() => navigate('/orders')}>← Orders</button><section className="card empty"><h1>Order not found</h1><p>This order may have been removed or the link is no longer valid.</p></section></main>;
  }

  const customer = data.customers.find((item: any) => item.id === order.customerId || item.apiId === order.customerId || item.email === order.customerEmail);
  const customerName = customer?.name || order.customer || 'Customer';
  const customerInitials = customerName.split(' ').filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();
  const placedDate = formatDate(order.date);
  const status = order.status;
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || items.reduce((sum: number, item: any) => sum + Number(item.total ?? Number(item.price || 0) * Number(item.quantity || 1)), 0));
  const shipping = Number(order.shipping || 0);
  const tax = Number(order.tax || 0);
  const discount = Number(order.discount || 0);
  const shippingAddress = addressText(order.shippingAddress) || customer?.address || '';
  const paymentLabel = titleCase(order.paymentStatus || 'pending');
  const paymentMethod = titleCase(order.paymentMethod || 'Not specified');

  const timeline = Array.isArray(order.timeline)
    ? order.timeline.map((entry: any, index: number) => ({
        id: entry._id || entry.id || index,
        title: entry.title || entry.event || entry.status || 'Order update',
        description: entry.note || entry.message || entry.description || '',
        date: formatDate(entry.createdAt || entry.date || entry.timestamp),
      }))
    : [];

  const setStatus = async (next: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled') => {
    try {
      await updateOrderStatus(order.id, next);
      toast(`Order marked ${next.toLowerCase()}`);
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Could not update order', 'error');
    }
  };

  const notifyCustomer = () => {
    const email = customer?.email || order.customerEmail;
    if (!email) {
      toast('Customer email is unavailable', 'error');
      return;
    }
    const subject = encodeURIComponent(`Update for order ${order.id}`);
    const body = encodeURIComponent(`Hello ${customer?.name || order.customer},\n\nYour order ${order.id} is currently ${status.toLowerCase()}.\n\nThank you.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return <main className="order-detail-figma">
    <header className="order-detail-header">
      <div>
        <div className="order-breadcrumb"><button className="bare" onClick={() => navigate('/orders')}>Orders</button><span>›</span><span>{order.id}</span></div>
        <h1>Order {order.id}</h1>
        <p>Placed on {placedDate}</p>
      </div>
      <div className="order-detail-header-actions"><span className={`status-chip order-status ${status.toLowerCase()}`}><i/>{status}</span><DropdownMenu><DropdownMenuTrigger asChild><button disabled={isSaving}>Actions <ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => window.print()}>Print order</DropdownMenuItem><DropdownMenuItem onSelect={notifyCustomer}>Email customer</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => setStatus('Pending')}>Mark pending</DropdownMenuItem><DropdownMenuItem onSelect={() => setStatus('Processing')}>Mark processing</DropdownMenuItem><DropdownMenuItem onSelect={() => setStatus('Shipped')}>Mark shipped</DropdownMenuItem><DropdownMenuItem onSelect={() => setStatus('Completed')}>Mark delivered</DropdownMenuItem><DropdownMenuItem onSelect={() => setStatus('Cancelled')}>Cancel order</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    </header>

    <div className="order-detail-grid">
      <div className="order-detail-main">
        <section className="order-panel order-products-panel">
          <header><h2>Purchased Products</h2></header>
          <div className="order-products-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th className="number">QTY</th><th className="number">PRICE</th><th className="number">TOTAL</th></tr></thead><tbody>{items.map((item: any, index: number) => {
            const product = data.products.find((entry: any) => entry.sku === item.sku || entry.apiId === item.productId || entry.id === item.productId);
            const quantity = Number(item.quantity || 1);
            const price = Number(item.price ?? product?.price ?? 0);
            const total = Number(item.total ?? price * quantity);
            return <tr key={item._id || item.id || `${item.sku || 'item'}-${index}`}><td><div className="order-product-cell"><span className="order-product-thumb">{product?.images?.[0] ? <img src={product.images[0]} alt=""/> : <Package/>}</span><div><strong>{item.name || product?.name || 'Product'}</strong><small>{product?.category || 'Catalog item'}</small></div></div></td><td className="mono">{item.sku || product?.sku || '—'}</td><td className="number">{quantity}</td><td className="number">${price.toFixed(2)}</td><td className="number strong">${total.toFixed(2)}</td></tr>;
          })}{!items.length && <tr><td colSpan={5}><div className="table-empty-state"><strong>No item details returned.</strong><span>The API did not include line items for this order.</span></div></td></tr>}</tbody></table></div>
        </section>

        <section className="order-panel order-payment-panel">
          <h2>Payment Summary</h2>
          <div className="order-payment-grid"><div className="order-totals"><div><span>Subtotal</span><b>${subtotal.toFixed(2)}</b></div><div><span>Shipping</span><b>${shipping.toFixed(2)}</b></div><div><span>Tax</span><b>${tax.toFixed(2)}</b></div>{discount > 0 && <div><span>Discount</span><b>−${discount.toFixed(2)}</b></div>}<div className="order-total"><strong>Total</strong><strong>${order.total.toFixed(2)}</strong></div></div><div className="order-payment-method"><CreditCard/><div><strong>{paymentLabel}</strong><p>{paymentMethod}</p><small>Payment status from the order record</small></div></div></div>
        </section>
      </div>

      <aside className="order-detail-side">
        <section className="order-panel order-customer-panel"><h2><UserRound/>Customer Info</h2><div className="order-customer-person"><span className="order-customer-avatar" aria-hidden="true">{customerInitials || <UserRound/>}</span><div><strong>{customerName}</strong><button className="bare" onClick={() => customer && navigate(`/customers/${customer.id}`)}>{customer?.email || order.customerEmail || 'Customer profile'}</button></div></div><div className="order-side-field"><span>PHONE</span><p>{customer?.phone || 'Not provided'}</p></div></section>

        <section className="order-panel order-shipping-panel"><h2><Truck/>Shipping Details</h2><div className="order-side-field"><span>SHIPPING ADDRESS</span><p>{shippingAddress || 'Address not provided'}</p></div><div className="order-side-field divided"><span>FULFILLMENT</span><p>{titleCase(order.fulfillmentStatus || status)}</p><button className="bare order-track-link" onClick={() => toast('Carrier tracking is not exposed by the current API')}>Tracking details</button></div></section>

        <section className="order-panel order-activity-panel"><h2><History/>Activity Log</h2><div className="order-timeline">{timeline.length ? timeline.map((entry: any, index: number) => <div className={index === 0 ? 'active' : ''} key={entry.id}><i/><strong>{titleCase(entry.title)}</strong>{entry.description && <p>{entry.description}</p>}<small>{entry.date}</small></div>) : <p className="order-timeline-empty">No activity history returned by the API.</p>}</div></section>
      </aside>
    </div>
  </main>;
}
