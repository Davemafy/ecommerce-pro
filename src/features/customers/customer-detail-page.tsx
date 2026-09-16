import { useState } from 'react';
import { ChevronDown, Mail, MapPin, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

export function CustomerDetailPage(){
 const navigate=useNavigate();
 const {customerId}=useParams();
 const {data}=useStore();
 const toast=useToast();
 const customer=data.customers.find(c=>c.id===decodeURIComponent(customerId||''));
 const [addressOpen,setAddressOpen]=useState(false);
 const [addressForm,setAddressForm]=useState({street:'',city:'',region:'',country:''});
 const [savedAddress,setSavedAddress]=useState('');
 const [note,setNote]=useState('');
 const [notes,setNotes]=useState<Array<{text:string;date:string}>>([]);

 if(!customer)return <main className="figma-page"><section className="card empty"><h1>Customer not found</h1><p>This customer may have been removed or the link is no longer valid.</p><button onClick={()=>navigate('/customers')}>Back to customers</button></section></main>;

 const orders=data.orders.filter(o=>o.customerId===customer.id);
 const lifetimeValue=orders.reduce((sum,order)=>sum+order.total,0);
 const initials=customer.name.split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase();
 const address=savedAddress||customer.address||'';
 const saveAddress=()=>{
   if(!addressForm.street.trim()||!addressForm.city.trim()){toast('Street and city are required');return;}
   setSavedAddress([addressForm.street,addressForm.city,addressForm.region,addressForm.country].filter(Boolean).join('\n'));
   setAddressOpen(false);
   toast('Address saved');
 };
 const addNote=()=>{
   const value=note.trim();
   if(!value) return;
   setNotes(current=>[{text:value,date:new Date().toLocaleDateString()},...current]);
   setNote('');
   toast('Internal note added');
 };
 const copyEmail=async()=>{
   try{await navigator.clipboard.writeText(customer.email);toast('Email copied');}
   catch{toast(customer.email);}
 };

 return <main className="figma-page customer-detail-figma">
   <section className="card customer-hero">
     <div className="customer-avatar-photo customer-avatar-initials" aria-hidden="true">{initials}</div>
     <div className="customer-hero-copy"><h1>{customer.name}</h1><p><Mail/>{customer.email}</p><div><span className="vip-chip">CUSTOMER</span><span className="active-chip">{customer.status||'Active'}</span></div></div>
     <DropdownMenu><DropdownMenuTrigger asChild><button className="customer-actions">Actions <ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>navigate('/orders')}>View orders</DropdownMenuItem><DropdownMenuItem onSelect={copyEmail}>Copy email address</DropdownMenuItem><DropdownMenuItem onSelect={()=>setAddressOpen(true)}>Add address</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
   </section>

   <div className="customer-grid">
     <section className="card order-history"><div className="customer-section-head"><h2>Order History</h2><button className="bare linkish" onClick={()=>navigate('/orders')}>View All</button></div><table><thead><tr><th>ORDER ID</th><th>DATE</th><th>STATUS</th><th className="number">TOTAL</th></tr></thead><tbody>{orders.length?orders.map(o=><tr key={o.id} onClick={()=>navigate(`/orders/${o.id}`)}><td className="mono">#{o.id}</td><td>{new Date(o.date).toLocaleDateString()}</td><td><span className={`status-chip ${o.status.toLowerCase()}`}>{o.status}</span></td><td className="number">${o.total.toFixed(2)}</td></tr>):<tr><td colSpan={4}><div className="table-empty-state"><strong>No orders yet.</strong><span>New customer orders will appear here automatically.</span></div></td></tr>}</tbody></table></section>

     <aside className="customer-side">
       <section className="card customer-info"><h2>Personal Information</h2><div className="info-grid"><div><span>FULL NAME</span><p>{customer.name}</p></div><div><span>EMAIL</span><p>{customer.email}</p></div><div><span>PHONE</span><p>{customer.phone||'Not provided'}</p></div><div><span>STATUS</span><p>{customer.status||'Active'}</p></div><div><span>ORDERS</span><p>{orders.length}</p></div><div><span>LIFETIME VALUE</span><p>${lifetimeValue.toFixed(2)}</p></div></div></section>

       <section className="card saved-address"><h2><MapPin/>Saved Address</h2>{address?<div><span className="address-chip">DEFAULT</span><b>{customer.name}</b><p>{address}</p></div>:<div className="customer-empty-card"><b>No address saved</b><p>Add a shipping or billing address for this customer.</p></div>}<button onClick={()=>setAddressOpen(true)}>＋ {address?'Edit Address':'Add New Address'}</button></section>

       <section className="card internal-notes"><h2>Internal Notes</h2><div className="notes-list">{notes.length?notes.map((item,index)=><div className="notes-box" key={`${item.date}-${index}`}><b>{item.date}</b><p>{item.text}</p></div>):<div className="notes-box notes-empty">No internal notes yet.</div>}</div><label className="note-composer"><textarea value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();addNote();}}} placeholder="Add a note..."/><button className="bare" onClick={addNote} aria-label="Add internal note"><Send/></button></label></section>
     </aside>
   </div>

   <Modal open={addressOpen} title={address?'Edit address':'Add address'} description="Store a default customer address in this frontend preview." onClose={()=>setAddressOpen(false)} footer={<><button onClick={()=>setAddressOpen(false)}>Cancel</button><button className="primary" onClick={saveAddress}>Save address</button></>}><FormFields values={addressForm} onChange={(name,value)=>setAddressForm(current=>({...current,[name]:value}))} fields={[{name:'street',label:'Street address'},{name:'city',label:'City'},{name:'region',label:'State / region'},{name:'country',label:'Country'}]}/></Modal>
 </main>;
}
