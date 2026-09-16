import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, Search } from 'lucide-react';
import { DataTable } from '../../components/ui/data-table';
import { ExportButton } from '../../components/ui/export-button';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { PageHeader } from '../../components/ui/page-header';
import { useStore } from '../../data/store';

export function OrdersPage(){
  const navigate=useNavigate(),{data,createOrder}=useStore(),toast=useToast();
  const [query,setQuery]=useState(''),[creating,setCreating]=useState(false),[form,setForm]=useState({email:'',sku:'',quantity:'1'}),[error,setError]=useState('');
  const filtered=useMemo(()=>data.orders.filter(o=>`${o.id} ${o.customer} ${o.status}`.toLowerCase().includes(query.toLowerCase())),[data.orders,query]);
  const exportRows=filtered.map(order=>({orderId:order.id,customer:order.customer,date:order.date,total:order.total,status:order.status,sku:order.sku,quantity:order.quantity}));
  const rows=filtered.map((order)=>[
    `#${order.id}`,order.customer,new Date(order.date).toLocaleDateString(),`$${order.total.toFixed(2)}`,
    <span className={`status-chip ${order.status==='Pending'?'unpaid':'paid'}`}>{order.status==='Pending'?'Unpaid':'Paid'}</span>,
    <span className={`status-chip ${order.status.toLowerCase()}`}>{order.status}</span>,
    <button className="bare table-action-button" aria-label={`Open ${order.id}`} onClick={(event)=>{event.stopPropagation();navigate(`/orders/${order.id}`)}}><MoreVertical/></button>,
  ]);
  const close=()=>{setCreating(false);setError('');};
  const save=()=>{try{createOrder(form);close();setForm({email:'',sku:'',quantity:'1'});toast('Order created');}catch(e:any){setError(e.message)}};
  const valid=form.email.includes('@')&&Boolean(form.sku.trim())&&Number(form.quantity)>0;
  return <main><PageHeader title="Orders" subtitle="Manage and track customer orders."><ExportButton data={exportRows} filename="commercepro-orders.csv"/><button className="primary" onClick={()=>setCreating(true)}><Plus/>Create Order</button></PageHeader><div className="toolbar"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search order ID, customer, or status"/></div>
    <DataTable columns={['ORDER','CUSTOMER','DATE','TOTAL','PAYMENT','FULFILLMENT','ACTIONS']} rows={rows} onRowClick={(row)=>navigate(`/orders/${String(row[0]).replace('#','')}`)} emptyTitle="No orders match your search" emptyMessage="Try another customer, order ID, or status."/>
    <Modal open={creating} title="Create order" description="Create an order using an existing customer and catalog SKU." onClose={close} footer={<><button onClick={close}>Cancel</button><button className="primary" disabled={!valid} onClick={save}>Create order</button></>}><FormFields values={form} onChange={(n,v)=>{setError('');setForm(x=>({...x,[n]:v}))}} fields={[{name:'email',label:'Customer email',type:'email',placeholder:data.customers[0]?.email||'customer@example.com',required:true},{name:'sku',label:'Product SKU',placeholder:data.products.find(p=>p.status==='Active')?.sku||'SKU-001',required:true},{name:'quantity',label:'Quantity',type:'number',placeholder:'1',required:true}]}/><p className="modal-helper">Use an existing customer email and an active product SKU from this demo dataset.</p>{error&&<p className="form-error">{error}</p>}</Modal>
  </main>;
}
