import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
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
  const rows=filtered.map(o=>[`#${o.id}`,o.customer,new Date(o.date).toLocaleDateString(),`$${o.total.toFixed(2)}`,o.status]);
  const save=()=>{try{createOrder(form);setCreating(false);setForm({email:'',sku:'',quantity:'1'});setError('');toast('Order created');}catch(e){setError(e.message)}};
  return <main><PageHeader title="Orders" subtitle="Manage and track customer orders."><ExportButton/><button className="primary" onClick={()=>setCreating(true)}><Plus/>Create Order</button></PageHeader><div className="toolbar"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search orders"/></div>
    <DataTable columns={['ORDER','CUSTOMER','DATE','TOTAL','STATUS']} rows={rows} onRowClick={(row)=>navigate(`/orders/${row[0].replace('#','')}`)}/>
    <Modal open={creating} title="Create order" description="Create an order for an existing customer." onClose={()=>setCreating(false)} footer={<><button onClick={()=>setCreating(false)}>Cancel</button><button className="primary" onClick={save}>Create order</button></>}><FormFields values={form} onChange={(n,v)=>setForm(x=>({...x,[n]:v}))} fields={[{name:'email',label:'Customer email',type:'email'},{name:'sku',label:'Product SKU'},{name:'quantity',label:'Quantity',type:'number'}]}/>{error&&<p className="form-error">{error}</p>}</Modal>
  </main>;
}
