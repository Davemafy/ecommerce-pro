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

const PAGE_SIZE=5;

export function CustomersPage(){
  const navigate=useNavigate(),{data,addCustomer}=useStore(),toast=useToast();
  const [creating,setCreating]=useState(false),[query,setQuery]=useState(''),[form,setForm]=useState({name:'',email:'',phone:''}),[error,setError]=useState(''),[page,setPage]=useState(1);
  const customers=useMemo(()=>data.customers.filter((c)=>`${c.name} ${c.email}`.toLowerCase().includes(query.toLowerCase())),[data.customers,query]);
  const pageCount=Math.max(1,Math.ceil(customers.length/PAGE_SIZE));
  const currentPage=Math.min(page,pageCount);
  const visibleCustomers=customers.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  const rows=visibleCustomers.map((c)=>{const os=data.orders.filter((o)=>o.customerId===c.id); return [c.name,c.email,String(os.length),`$${os.reduce((a,o)=>a+o.total,0).toFixed(2)}`,c.status];});
  const closeCreate=()=>{setCreating(false);setError('');};
  const save=()=>{ if(!form.name.trim()||!form.email.includes('@')){setError('Enter a name and valid email address.');return;} if(data.customers.some((c)=>c.email.toLowerCase()===form.email.toLowerCase())){setError('A customer with that email already exists.');return;} addCustomer({...form,name:form.name.trim(),email:form.email.trim().toLowerCase(),phone:form.phone.trim()});closeCreate();setForm({name:'',email:'',phone:''});setPage(1);toast('Customer added');};
  const openCustomer=(row:any[])=>{const customer=customers.find((item)=>item.email===row[1]); if(customer) navigate(`/customers/${encodeURIComponent(customer.id)}`);};
  const valid=Boolean(form.name.trim())&&form.email.includes('@');
  const start=customers.length?(currentPage-1)*PAGE_SIZE+1:0;
  const end=Math.min(currentPage*PAGE_SIZE,customers.length);
  return <main><PageHeader title="Customers" subtitle="View customer profiles, activity and lifetime value."><ExportButton data={customers.map(c=>({name:c.name,email:c.email,phone:c.phone,status:c.status}))} filename="commercepro-customers.csv"/><button className="primary" onClick={()=>setCreating(true)}><Plus/>Add Customer</button></PageHeader>
    <SummaryCards items={[["TOTAL CUSTOMERS",String(data.customers.length),'Customer accounts'],['REPEAT CUSTOMERS',`${Math.round(data.customers.filter(c=>data.orders.filter(o=>o.customerId===c.id).length>1).length/Math.max(1,data.customers.length)*100)}%`,'2+ orders'],['TOTAL CUSTOMER VALUE',`$${data.orders.reduce((a,o)=>a+o.total,0).toFixed(2)}`,'Recorded orders']]}/>
    <div className="toolbar"><Search/><input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(1)}} placeholder="Search name or email"/></div>
    <DataTable columns={['CUSTOMER','EMAIL','ORDERS','LIFETIME VALUE','STATUS']} rows={rows} onRowClick={openCustomer} emptyTitle="No customers match your search" emptyMessage="Try another name or email address."/>
    <div className="pagination-bar"><span>Showing {start} to {end} of {customers.length} customers</span><div><button disabled={currentPage<=1} onClick={()=>setPage(value=>Math.max(1,value-1))}>‹</button><strong>Page {currentPage} of {pageCount}</strong><button disabled={currentPage>=pageCount} onClick={()=>setPage(value=>Math.min(pageCount,value+1))}>›</button></div></div>
    <Modal open={creating} title="Add customer" description="Create a customer profile for orders and activity." onClose={closeCreate} footer={<><button onClick={closeCreate}>Cancel</button><button className="primary" disabled={!valid} onClick={save}>Add customer</button></>}><FormFields values={form} onChange={(n,v)=>{setError('');setForm(x=>({...x,[n]:v}))}} fields={[{name:'name',label:'Full name',placeholder:'Enter customer name',required:true,autoComplete:'name'},{name:'email',label:'Email address',type:'email',placeholder:'name@example.com',required:true,autoComplete:'email'},{name:'phone',label:'Phone number',type:'tel',placeholder:'+1 555 0100',autoComplete:'tel'}]}/>{error&&<p className="form-error">{error}</p>}</Modal>
  </main>;
}
