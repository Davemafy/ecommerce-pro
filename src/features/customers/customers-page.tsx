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

export function CustomersPage(){
  const navigate=useNavigate(),{data,addCustomer}=useStore(),toast=useToast();
  const [creating,setCreating]=useState(false),[query,setQuery]=useState(''),[form,setForm]=useState({name:'',email:'',phone:''}),[error,setError]=useState('');
  const customers=useMemo(()=>data.customers.filter((c)=>`${c.name} ${c.email}`.toLowerCase().includes(query.toLowerCase())),[data.customers,query]);
  const rows=customers.map((c)=>{const os=data.orders.filter((o)=>o.customerId===c.id); return [c.name,c.email,String(os.length),`$${os.reduce((a,o)=>a+o.total,0).toFixed(2)}`,c.status];});
  const save=()=>{ if(!form.name.trim()||!form.email.includes('@')){setError('Enter a name and valid email address.');return;} if(data.customers.some((c)=>c.email.toLowerCase()===form.email.toLowerCase())){setError('A customer with that email already exists.');return;} addCustomer(form);setCreating(false);setForm({name:'',email:'',phone:''});setError('');toast('Customer added');};
  return <main><PageHeader title="Customers" subtitle="View customer profiles, activity and lifetime value."><ExportButton/><button className="primary" onClick={()=>setCreating(true)}><Plus/>Add Customer</button></PageHeader>
    <SummaryCards items={[['TOTAL CUSTOMERS',String(data.customers.length),'Customer accounts'],['REPEAT CUSTOMERS',`${Math.round(data.customers.filter(c=>data.orders.filter(o=>o.customerId===c.id).length>1).length/Math.max(1,data.customers.length)*100)}%`,'2+ orders'],['TOTAL CUSTOMER VALUE',`$${data.orders.reduce((a,o)=>a+o.total,0).toFixed(2)}`,'Recorded orders']]}/>
    <div className="toolbar"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search customers"/></div>
    <DataTable columns={['CUSTOMER','EMAIL','ORDERS','LIFETIME VALUE','STATUS']} rows={rows} onRowClick={(row)=>navigate(`/customers/${encodeURIComponent(row[1])}`)}/>
    <Modal open={creating} title="Add customer" onClose={()=>setCreating(false)} footer={<><button onClick={()=>setCreating(false)}>Cancel</button><button className="primary" onClick={save}>Add customer</button></>}><FormFields values={form} onChange={(n,v)=>setForm(x=>({...x,[n]:v}))} fields={[{name:'name',label:'Full name'},{name:'email',label:'Email address',type:'email'},{name:'phone',label:'Phone number',type:'tel'}]}/>{error&&<p className="form-error">{error}</p>}</Modal>
  </main>;
}
