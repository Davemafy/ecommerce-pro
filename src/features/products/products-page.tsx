import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, Search } from 'lucide-react';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

const empty = { name:'', sku:'', category:'', price:'', stock:'' };

export function ProductsPage() {
  const navigate = useNavigate();
  const { data, addProduct } = useStore();
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('All Categories');
  const [status,setStatus]=useState('All Status');
  const [creating,setCreating]=useState(false);
  const [form,setForm]=useState(empty);
  const [error,setError]=useState('');
  const toast=useToast();

  const rows=useMemo(() => data.products.filter((item) => {
    const q=query.toLowerCase();
    return `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(q)
      && (category==='All Categories'||item.category===category)
      && (status==='All Status'||item.status===status);
  }),[data.products,query,category,status]);

  const categories=[...new Set(data.products.map((p)=>p.category))];
  const save=()=>{
    if(!form.name.trim()||!form.sku.trim()||!form.category.trim()){ setError('Name, SKU and category are required.'); return; }
    if(data.products.some((p)=>p.sku.toLowerCase()===form.sku.trim().toLowerCase())){ setError('That SKU already exists.'); return; }
    addProduct({ ...form, name:form.name.trim(), sku:form.sku.trim(), category:form.category.trim(), price:Number(form.price)||0, stock:Number(form.stock)||0, status:'Active', description:'' });
    setCreating(false); setForm(empty); setError(''); toast('Product added');
  };

  return <main className="figma-page">
    <div className="figma-page-heading"><div><h1>Products Inventory</h1><p>Manage your catalog, stock levels, and product status.</p></div><button className="primary" onClick={()=>setCreating(true)}><Plus/>Add Product</button></div>
    <section className="figma-toolbar">
      <label className="figma-search"><Search/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search products, SKU, or categories..." /></label>
      <div className="figma-filters">
        <select value={category} onChange={(e)=>setCategory(e.target.value)}><option>All Categories</option>{categories.map((x)=><option key={x}>{x}</option>)}</select>
        <select value={status} onChange={(e)=>setStatus(e.target.value)}><option>All Status</option><option>Active</option><option>Draft</option><option>Archived</option></select>
        <button className="filter-button" aria-label="More filters"><Filter/></button>
      </div>
    </section>
    <section className="figma-table-card"><table className="figma-table"><thead><tr><th/><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th className="number">PRICE</th><th className="number">STOCK</th><th>STATUS</th><th/></tr></thead>
      <tbody>{rows.map((item)=><tr key={item.id} className={item.stock<=5?'low-stock-row':''} onClick={()=>navigate(`/products/${encodeURIComponent(item.id)}`)}>
        <td onClick={(e)=>e.stopPropagation()}><input type="checkbox" aria-label={`Select ${item.name}`}/></td>
        <td><div className="product-cell"><div className="product-thumb"><span aria-hidden="true">⌨</span></div><strong>{item.name}</strong></div></td><td className="mono">{item.sku}</td><td>{item.category}</td><td className="number strong">${item.price.toFixed(2)}</td>
        <td className="number"><span className={item.stock<=5?'stock-pill low':'stock-pill'}>{item.stock}</span></td><td><span className={`status-chip ${item.status.toLowerCase()}`}>{item.status}</span></td><td>⋮</td>
      </tr>)}</tbody></table><footer className="table-footer"><strong>Showing 1 to {rows.length} of 156 products</strong><div><button disabled>‹</button><button>›</button></div></footer></section>
    <Modal open={creating} title="Add product" description="Add a product to your catalog." onClose={()=>setCreating(false)}
      footer={<><button onClick={()=>setCreating(false)}>Cancel</button><button className="primary" onClick={save}>Add product</button></>}>
      <FormFields values={form} onChange={(n,v)=>setForm((x)=>({...x,[n]:v}))} fields={[
        {name:'name',label:'Product name',required:true},{name:'sku',label:'SKU',required:true},{name:'category',label:'Category',required:true},{name:'price',label:'Price',type:'number'},{name:'stock',label:'Opening stock',type:'number'}
      ]}/>{error&&<p className="form-error">{error}</p>}
    </Modal>
  </main>;
}
