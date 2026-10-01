import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Mail, MapPin, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';
import { commerceService } from '../../services/commerce-service';

function noteText(note: any) {
  if (typeof note === 'string') return note;
  return note?.note || note?.text || note?.message || '';
}

function noteDate(note: any) {
  const value = note?.createdAt || note?.date;
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const routeId = decodeURIComponent(customerId || '');
  const { data, updateCustomer, addCustomerNote, isSaving } = useStore();
  const toast = useToast();
  const listCustomer = data.customers.find((entry: any) => entry.id === routeId || entry.apiId === routeId);
  const apiId = listCustomer?.apiId || routeId;

  const customerQuery = useQuery({
    queryKey: ['customer', apiId],
    queryFn: () => commerceService.getCustomerDetail(apiId),
    enabled: Boolean(apiId),
    staleTime: 30_000,
    retry: 1,
  });

  const customer: any = customerQuery.data || listCustomer;
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: '', city: '', region: '', country: '' });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!customer && customerQuery.isLoading) {
    return <main className="figma-page"><section className="card empty"><h1>Loading customer…</h1><p>Fetching the latest profile and order history.</p></section></main>;
  }

  if (!customer) {
    return <main className="figma-page"><section className="card empty"><h1>Customer not found</h1><p>This customer may have been removed or the link is no longer valid.</p><button onClick={() => navigate('/customers')}>Back to customers</button></section></main>;
  }

  const globalOrders = data.orders.filter((order: any) => order.customerId === customer.id || order.customerId === customer.apiId || order.customerEmail === customer.email);
  const orders = customer.detailOrders?.length ? customer.detailOrders : globalOrders;
  const lifetimeValue = customer.totalSpent || orders.reduce((sum: number, order: any) => sum + order.total, 0);
  const orderCount = customer.totalOrders || orders.length;
  const initials = customer.name.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();
  const address = customer.address || '';
  const backendNotes = Array.isArray(customer.notes) ? customer.notes : [];
  const refunds = Array.isArray(customer.refunds) ? customer.refunds : [];
  const refundedTotal = refunds.reduce((sum: number, refund: any) => sum + Number(refund.amount || refund.total || 0), 0);

  const openAddress = () => {
    const currentAddress = customer.addresses?.[0] || {};
    setAddressForm({
      street: currentAddress.street || currentAddress.address1 || currentAddress.line1 || '',
      city: currentAddress.city || '',
      region: currentAddress.region || currentAddress.state || '',
      country: currentAddress.country || '',
    });
    setError('');
    setAddressOpen(true);
  };

  const saveAddress = async () => {
    if (!addressForm.street.trim() || !addressForm.city.trim()) {
      setError('Street and city are required.');
      return;
    }
    const nextAddress = {
      street: addressForm.street.trim(),
      city: addressForm.city.trim(),
      region: addressForm.region.trim(),
      country: addressForm.country.trim(),
    };

    try {
      await updateCustomer(customer.id, { addresses: [nextAddress, ...(customer.addresses || []).slice(1)] });
      setAddressOpen(false);
      toast('Address saved');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save address.');
    }
  };

  const submitNote = async () => {
    const value = note.trim();
    if (!value) return;
    try {
      await addCustomerNote(customer.id, value);
      setNote('');
      toast('Internal note added');
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Could not add note', 'error');
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(customer.email);
      toast('Email copied');
    } catch {
      toast(customer.email);
    }
  };

  return <main className="figma-page customer-detail-figma">
    <section className="card customer-hero">
      <div className="customer-avatar-photo customer-avatar-initials" aria-hidden="true">{initials}</div>
      <div className="customer-hero-copy"><h1>{customer.name}</h1><p><Mail/>{customer.email}</p><div><span className="vip-chip">CUSTOMER</span><span className={`active-chip ${customer.status.toLowerCase()}`}>{customer.status}</span></div></div>
      <DropdownMenu><DropdownMenuTrigger asChild><button className="customer-actions">Actions <ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => navigate('/orders')}>View orders</DropdownMenuItem><DropdownMenuItem onSelect={copyEmail}>Copy email address</DropdownMenuItem><DropdownMenuItem onSelect={openAddress}>{address ? 'Edit address' : 'Add address'}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </section>

    <div className="customer-grid">
      <section className="card order-history"><div className="customer-section-head"><h2>Order History</h2><button className="bare linkish" onClick={() => navigate('/orders')}>View All</button></div><table><thead><tr><th>ORDER ID</th><th>DATE</th><th>STATUS</th><th className="number">TOTAL</th></tr></thead><tbody>{orders.length ? orders.map((order: any) => <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)}><td className="mono">#{order.id}</td><td>{order.date ? new Date(order.date).toLocaleDateString() : '—'}</td><td><span className={`status-chip ${order.status.toLowerCase()}`}>{order.status}</span></td><td className="number">${order.total.toFixed(2)}</td></tr>) : <tr><td colSpan={4}><div className="table-empty-state"><strong>No orders yet.</strong><span>New customer orders will appear here automatically.</span></div></td></tr>}</tbody></table></section>

      <aside className="customer-side">
        <section className="card customer-info"><h2>Personal Information</h2><div className="info-grid"><div><span>FULL NAME</span><p>{customer.name}</p></div><div><span>EMAIL</span><p>{customer.email}</p></div><div><span>PHONE</span><p>{customer.phone || 'Not provided'}</p></div><div><span>STATUS</span><p>{customer.status}</p></div><div><span>ORDERS</span><p>{orderCount}</p></div><div><span>LIFETIME VALUE</span><p>${Number(lifetimeValue).toFixed(2)}</p></div>{refunds.length > 0 && <div><span>REFUNDED</span><p>${refundedTotal.toFixed(2)}</p></div>}</div></section>

        <section className="card saved-address"><h2><MapPin/>Saved Address</h2>{address ? <div><span className="address-chip">DEFAULT</span><b>{customer.name}</b><p>{address}</p></div> : <div className="customer-empty-card"><b>No address saved</b><p>Add a shipping or billing address for this customer.</p></div>}<button onClick={openAddress}>＋ {address ? 'Edit Address' : 'Add New Address'}</button></section>

        <section className="card internal-notes"><h2>Internal Notes</h2><div className="notes-list">{backendNotes.length ? backendNotes.map((item: any, index: number) => <div className="notes-box" key={item._id || item.id || index}><b>{noteDate(item) || 'Note'}</b><p>{noteText(item)}</p></div>) : <div className="notes-box notes-empty">No internal notes yet.</div>}</div><label className="note-composer"><textarea value={note} onChange={(event) => setNote(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); submitNote(); } }} placeholder="Add a note..."/><button className="bare" disabled={isSaving || !note.trim()} onClick={submitNote} aria-label="Add internal note"><Send/></button></label></section>
      </aside>
    </div>

    <Modal open={addressOpen} title={address ? 'Edit address' : 'Add address'} description="Save the customer's default address." onClose={() => setAddressOpen(false)} footer={<><button onClick={() => setAddressOpen(false)}>Cancel</button><button className="primary" disabled={isSaving} onClick={saveAddress}>{isSaving ? 'Saving…' : 'Save address'}</button></>}><FormFields values={addressForm} onChange={(name, value) => { setError(''); setAddressForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'street', label: 'Street address', required: true }, { name: 'city', label: 'City', required: true }, { name: 'region', label: 'State / region' }, { name: 'country', label: 'Country' }]}/>{error && <p className="form-error">{error}</p>}</Modal>
  </main>;
}
