import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { DataTable } from '../../components/ui/data-table';
import { ExportButton } from '../../components/ui/export-button';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { PageHeader } from '../../components/ui/page-header';
import { SummaryCards } from '../../components/ui/summary-cards';
import { useStore } from '../../data/store';

const PAGE_SIZE = 5;

export function CustomersPage() {
  const navigate = useNavigate();
  const { data, addCustomer, isSaving } = useStore();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const customers = useMemo(() => data.customers.filter((customer: any) => `${customer.name} ${customer.email}`.toLowerCase().includes(query.toLowerCase())), [data.customers, query]);
  const pageCount = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleCustomers = customers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rows = visibleCustomers.map((customer: any) => {
    const orders = data.orders.filter((order: any) => order.customerId === customer.id || order.customerId === customer.apiId);
    const orderCount = customer.totalOrders || orders.length;
    const lifetime = customer.totalSpent || orders.reduce((sum: number, order: any) => sum + order.total, 0);
    return [customer.name, customer.email, String(orderCount), `$${lifetime.toFixed(2)}`, customer.status];
  });

  const closeCreate = () => { setCreating(false); setError(''); };
  const save = async () => {
    if (!form.name.trim() || !form.email.includes('@')) {
      setError('Enter a name and valid email address.');
      return;
    }
    if (data.customers.some((customer: any) => customer.email.toLowerCase() === form.email.toLowerCase())) {
      setError('A customer with that email already exists.');
      return;
    }
    try {
      await addCustomer({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() });
      closeCreate();
      setForm({ name: '', email: '', phone: '' });
      setPage(1);
      toast('Customer added');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add customer.');
    }
  };

  const openCustomer = (row: any[]) => {
    const customer = customers.find((item: any) => item.email === row[1]);
    if (customer) navigate(`/customers/${encodeURIComponent(customer.id)}`);
  };

  const valid = Boolean(form.name.trim()) && form.email.includes('@');
  const start = customers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, customers.length);
  const repeatCustomers = data.customers.filter((customer: any) => (customer.totalOrders || data.orders.filter((order: any) => order.customerId === customer.id || order.customerId === customer.apiId).length) > 1).length;
  const totalCustomerValue = data.customers.reduce((sum: number, customer: any) => sum + Number(customer.totalSpent || 0), 0) || data.orders.reduce((sum: number, order: any) => sum + order.total, 0);

  return <main><PageHeader title="Customers" subtitle="View customer profiles, activity and lifetime value."><ExportButton data={customers.map((customer: any) => ({ name: customer.name, email: customer.email, phone: customer.phone, status: customer.status }))} filename="commercepro-customers.csv"/><button className="primary" onClick={() => setCreating(true)}><Plus/>Add Customer</button></PageHeader>
    <SummaryCards items={[['TOTAL CUSTOMERS', String(data.customers.length), 'Customer accounts'], ['REPEAT CUSTOMERS', `${Math.round(repeatCustomers / Math.max(1, data.customers.length) * 100)}%`, '2+ orders'], ['TOTAL CUSTOMER VALUE', `$${totalCustomerValue.toFixed(2)}`, 'Recorded orders']]}/>
    <div className="toolbar"><Search/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or email"/></div>
    <DataTable columns={['CUSTOMER', 'EMAIL', 'ORDERS', 'LIFETIME VALUE', 'STATUS']} rows={rows} onRowClick={openCustomer} emptyTitle="No customers match your search" emptyMessage="Try another name or email address."/>
    <div className="pagination-bar"><span>Showing {start} to {end} of {customers.length} customers</span><div><button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button><strong>Page {currentPage} of {pageCount}</strong><button disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button></div></div>
    <Modal open={creating} title="Add customer" description="Create a customer profile for orders and activity." onClose={closeCreate} footer={<><button onClick={closeCreate}>Cancel</button><button className="primary" disabled={!valid || isSaving} onClick={save}>{isSaving ? 'Adding…' : 'Add customer'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'name', label: 'Full name', placeholder: 'Enter customer name', required: true, autoComplete: 'name' }, { name: 'email', label: 'Email address', type: 'email', placeholder: 'name@example.com', required: true, autoComplete: 'email' }, { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '+1 555 0100', autoComplete: 'tel' }]}/>{error && <p className="form-error">{error}</p>}</Modal>
  </main>;
}
