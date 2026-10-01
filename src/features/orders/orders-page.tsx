import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { DataTable } from '../../components/ui/data-table';
import { ExportButton } from '../../components/ui/export-button';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { PageHeader } from '../../components/ui/page-header';
import { useStore } from '../../data/store';

const PAGE_SIZE = 6;
const formatStatus = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { data, createOrder, isSaving } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: '', sku: '', quantity: '1' });
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => data.orders.filter((order: any) => `${order.id} ${order.customer} ${order.status} ${order.paymentStatus}`.toLowerCase().includes(query.toLowerCase())), [data.orders, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const exportRows = filtered.map((order: any) => ({ orderId: order.id, customer: order.customer, date: order.date, total: order.total, paymentStatus: order.paymentStatus, fulfillmentStatus: order.fulfillmentStatus }));
  const rows = visible.map((order: any) => [
    `#${order.id}`,
    order.customer,
    formatDate(order.date),
    `$${order.total.toFixed(2)}`,
    <span className={`status-chip ${order.paymentStatus === 'paid' ? 'paid' : 'unpaid'}`}>{formatStatus(order.paymentStatus)}</span>,
    <span className={`status-chip ${order.status.toLowerCase()}`}>{order.status}</span>,
    <button className="bare table-action-button" aria-label={`Open ${order.id}`} onClick={(event) => { event.stopPropagation(); navigate(`/orders/${order.id}`); }}><MoreVertical/></button>,
  ]);

  const close = () => { setCreating(false); setError(''); };
  const save = async () => {
    try {
      await createOrder(form);
      close();
      setForm({ email: '', sku: '', quantity: '1' });
      setPage(1);
      toast('Order created');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create order.');
    }
  };

  const valid = form.email.includes('@') && Boolean(form.sku.trim()) && Number(form.quantity) > 0;
  const start = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return <main className="orders-page"><PageHeader title="Orders" subtitle="Manage and track customer orders."><ExportButton data={exportRows} filename="commercepro-orders.csv"/><button className="primary" onClick={() => setCreating(true)}><Plus/>Create Order</button></PageHeader><div className="toolbar"><Search/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search order ID, customer, or status"/></div>
    <DataTable columns={['ORDER', 'CUSTOMER', 'DATE', 'TOTAL', 'PAYMENT', 'FULFILLMENT', 'ACTIONS']} rows={rows} onRowClick={(row) => navigate(`/orders/${String(row[0]).replace('#', '')}`)} emptyTitle="No orders match your search" emptyMessage="Try another customer, order ID, or status."/>
    <div className="pagination-bar"><span>Showing {start} to {end} of {filtered.length} orders</span><div><button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button><strong>Page {currentPage} of {pageCount}</strong><button disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button></div></div>
    <Modal open={creating} title="Create order" description="Create an order using an existing customer and catalog SKU." onClose={close} footer={<><button onClick={close}>Cancel</button><button className="primary" disabled={!valid || isSaving} onClick={save}>{isSaving ? 'Creating…' : 'Create order'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'email', label: 'Customer email', type: 'email', placeholder: data.customers[0]?.email || 'customer@example.com', required: true }, { name: 'sku', label: 'Product SKU', placeholder: data.products.find((product: any) => product.status === 'Active')?.sku || 'SKU-001', required: true }, { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', required: true }]}/>{error && <p className="form-error">{error}</p>}</Modal>
  </main>;
}
