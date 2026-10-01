import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Search } from 'lucide-react';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { ProductVisual } from '../../components/ui/product-visual';
import { useStore } from '../../data/store';

const empty = { name: '', sku: '', category: '', price: '', stock: '' };
const PAGE_SIZE = 6;

function isLowStock(product: any) {
  if (product.stock <= 0) return true;
  if (product.lowStockThreshold == null) return false;
  const threshold = Number(product.lowStockThreshold);
  return Number.isFinite(threshold) && product.stock <= threshold;
}

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, addProduct, isSaving } = useStore();
  const [query, setQuery] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All Status');
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(() => searchParams.get('new') === '1');
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const toast = useToast();

  const rows = useMemo(() => data.products.filter((item: any) => {
    const q = query.toLowerCase();
    return `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(q)
      && (category === 'All Categories' || item.category === category)
      && (status === 'All Status' || item.status === status)
      && (!lowOnly || isLowStock(item));
  }), [data.products, query, category, status, lowOnly]);

  const categories = [...new Set(data.products.map((product: any) => product.category))];
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = rows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, rows.length);

  const closeCreate = () => {
    setCreating(false);
    setError('');
    if (searchParams.has('new')) {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  };

  const save = async () => {
    if (!form.name.trim() || !form.sku.trim() || !form.category.trim()) {
      setError('Name, SKU and category are required.');
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid non-negative price.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError('Opening stock must be a non-negative whole number.');
      return;
    }
    if (data.products.some((product: any) => product.sku.toLowerCase() === form.sku.trim().toLowerCase())) {
      setError('That SKU already exists.');
      return;
    }

    try {
      await addProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        price,
        stock,
        status: 'Active',
        description: '',
      });
      closeCreate();
      setForm(empty);
      setPage(1);
      toast('Product added');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add product.');
    }
  };

  return <main className="figma-page">
    <div className="figma-page-heading"><div><h1>Products Inventory</h1><p>Manage your catalog, stock levels, and product status.</p></div><button className="primary" onClick={() => setCreating(true)}><Plus/>Add Product</button></div>
    <section className="figma-toolbar"><label className="figma-search"><Search/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search products, SKU, or categories..." /></label><div className="figma-filters"><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option>All Categories</option>{categories.map((value: any) => <option key={value}>{value}</option>)}</select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option>All Status</option><option>Active</option><option>Draft</option><option>Out of Stock</option></select><button className={`filter-button${lowOnly ? ' inventory-filter-active' : ''}`} aria-label={lowOnly ? 'Show all stock levels' : 'Show low stock only'} title={lowOnly ? 'Show all stock levels' : 'Show low stock only'} onClick={() => { setLowOnly((value) => !value); setPage(1); }}><Filter/></button></div></section>
    <section className="figma-table-card"><table className="figma-table"><thead><tr><th/><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th className="number">PRICE</th><th className="number">STOCK</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map((item: any) => <tr key={item.id} className={isLowStock(item) ? 'low-stock-row' : ''} onClick={() => navigate(`/products/${encodeURIComponent(item.id)}`)}><td onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${item.name}`}/></td><td><div className="product-cell"><ProductVisual name={item.name} src={item.images?.[0]}/><strong>{item.name}</strong></div></td><td className="mono">{item.sku}</td><td>{item.category}</td><td className="number strong">${item.price.toFixed(2)}</td><td className="number"><span className={isLowStock(item) ? 'stock-pill low' : 'stock-pill'}>{item.stock}</span></td><td><span className={`status-chip ${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span></td></tr>)}{!visibleRows.length && <tr><td colSpan={7}><div className="table-empty-state"><strong>No products match these filters.</strong><span>Clear filters or try another search.</span></div></td></tr>}</tbody></table><footer className="table-footer"><strong>Showing {start} to {end} of {rows.length} products</strong><div><button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button><span className="pagination-summary">Page {currentPage} of {pageCount}</span><button disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button></div></footer></section>
    <Modal open={creating} title="Add product" description="Add a complete catalog item with its opening stock." onClose={closeCreate} footer={<><button onClick={closeCreate}>Cancel</button><button className="primary" disabled={isSaving} onClick={save}>{isSaving ? 'Adding…' : 'Add product'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'name', label: 'Product name', placeholder: 'e.g. Wireless Mechanical Keyboard', required: true }, { name: 'sku', label: 'SKU', placeholder: 'e.g. KB-MECH-01', required: true }, { name: 'category', label: 'Category', placeholder: 'e.g. Electronics', required: true }, { name: 'price', label: 'Price', type: 'number', placeholder: '0.00', required: true }, { name: 'stock', label: 'Opening stock', type: 'number', placeholder: '0', required: true }]}/>{error && <p className="form-error">{error}</p>}</Modal>
  </main>;
}
