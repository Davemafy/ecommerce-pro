import { useMemo, useState } from 'react';
import { Filter, MoreVertical, Search, ShoppingCart } from 'lucide-react';
import { ExportButton } from '../../components/ui/export-button';
import { Modal, useToast } from '../../components/ui/feedback';
import { FormFields } from '../../components/ui/form-fields';
import { useStore } from '../../data/store';

const PAGE_SIZE = 5;

function isLowStock(product: any) {
  if (product.stock <= 0) return true;
  if (product.lowStockThreshold == null) return false;
  const threshold = Number(product.lowStockThreshold);
  return Number.isFinite(threshold) && product.stock <= threshold;
}

export function InventoryPage() {
  const { data, adjustInventory, isSaving } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState(false);
  const [form, setForm] = useState({ sku: '', quantity: '', reason: '' });
  const [error, setError] = useState('');

  const rows = useMemo(() => data.products.filter((product: any) => {
    const matches = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matches && (!lowOnly || isLowStock(product));
  }), [data.products, query, lowOnly]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalUnits = data.products.reduce((sum: number, product: any) => sum + product.stock, 0);
  const lowStockCount = data.products.filter((product: any) => isLowStock(product)).length;
  const totalValue = data.products.reduce((sum: number, product: any) => sum + product.price * product.stock, 0);
  const start = rows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, rows.length);

  const closeAdjustment = () => { setAdjusting(false); setError(''); };
  const openAdjustment = (sku: string) => { setForm({ sku, quantity: '', reason: '' }); setError(''); setAdjusting(true); };

  const apply = async () => {
    const product = data.products.find((item: any) => item.sku.toLowerCase() === form.sku.trim().toLowerCase());
    if (!product) {
      setError('Enter a valid product SKU.');
      return;
    }
    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity === 0) {
      setError('Enter a non-zero whole-number adjustment.');
      return;
    }
    if (product.stock + quantity < 0) {
      setError(`This adjustment would take stock below zero. Current stock is ${product.stock}.`);
      return;
    }

    try {
      await adjustInventory(product.sku, quantity, form.reason.trim() || undefined);
      closeAdjustment();
      setForm({ sku: '', quantity: '', reason: '' });
      toast('Inventory updated');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update inventory.');
    }
  };

  const valid = Boolean(form.sku.trim()) && Number.isInteger(Number(form.quantity)) && Number(form.quantity) !== 0;

  return <main className="figma-page inventory-figma">
    <div className="figma-page-heading"><div><h1>Inventory Management</h1><p>Manage stock levels and reorder points.</p></div><div className="page-actions"><button className={lowOnly ? 'inventory-filter-active' : ''} onClick={() => { setLowOnly((value) => !value); setPage(1); }}><Filter/>{lowOnly ? 'Show All' : 'Low Stock'}</button><ExportButton data={rows} filename="commercepro-inventory.csv"/></div></div>
    <div className="inventory-kpis"><article><span>TOTAL UNITS</span><strong>{totalUnits.toLocaleString()}</strong></article><article><span>LOW STOCK ALERTS</span><strong className={lowStockCount ? 'danger' : ''}>{lowStockCount}</strong></article><article><span>INVENTORY VALUE</span><strong>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></article><article><span>PRODUCTS</span><strong>{data.products.length}</strong></article></div>
    <section className="inventory-controls"><label className="figma-search"><Search/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search product, SKU, or category"/></label><span>{lowOnly ? 'Showing products at or below their reorder threshold' : 'Current catalog stock'}</span></section>
    <section className="figma-table-card"><table className="figma-table inventory-table"><thead><tr><th>PRODUCT NAME</th><th>SKU</th><th>CATEGORY</th><th className="number">CURRENT STOCK</th><th className="number">REORDER POINT</th><th>STATUS</th><th className="action-column">ACTIONS</th></tr></thead><tbody>
      {visibleRows.map((product: any) => {
        const threshold = product.lowStockThreshold == null ? null : Number(product.lowStockThreshold);
        const critical = product.stock <= 0;
        const lowStock = isLowStock(product);
        return <tr key={product.id} className={lowStock ? 'inventory-alert-row' : ''}><td className={lowStock ? 'danger' : ''}><strong>{product.name}</strong></td><td className="mono">{product.sku}</td><td>{product.category}</td><td className={`number ${lowStock ? 'danger' : ''}`}><b>{product.stock}</b></td><td className="number">{threshold == null || !Number.isFinite(threshold) ? '—' : threshold}</td><td><span className={`inventory-status-chip ${critical ? 'critical' : lowStock ? 'low' : 'ok'}`}>{critical ? 'Out of Stock' : lowStock ? 'Low Stock' : 'In Stock'}</span></td><td className="action-column"><button className="bare inventory-action" title="Adjust inventory" aria-label={`Adjust ${product.name} inventory`} onClick={() => openAdjustment(product.sku)}>{lowStock ? <ShoppingCart/> : <MoreVertical/>}</button></td></tr>;
      })}
      {!visibleRows.length && <tr><td colSpan={7}><div className="table-empty-state"><strong>No inventory matches these filters.</strong><span>Try another search or show all inventory.</span></div></td></tr>}
    </tbody></table><footer className="table-footer"><strong>Showing {start} to {end} of {rows.length} products</strong><div><button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button><span className="pagination-summary">Page {currentPage} of {pageCount}</span><button disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button></div></footer></section>
    <Modal open={adjusting} title="Adjust inventory" description="Record a stock correction against the live inventory service." onClose={closeAdjustment} footer={<><button onClick={closeAdjustment}>Cancel</button><button className="primary" disabled={!valid || isSaving} onClick={apply}>{isSaving ? 'Applying…' : 'Apply adjustment'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'sku', label: 'Product SKU', placeholder: data.products[0]?.sku || 'Enter product SKU', required: true }, { name: 'quantity', label: 'Quantity adjustment', type: 'number', placeholder: 'e.g. 25 or -2', required: true, step: 1, inputMode: 'numeric' }, { name: 'reason', label: 'Reason', placeholder: 'Restock, damaged item, recount...' }]}/>{error && <p className="form-error">{error}</p>}</Modal>
  </main>;
}
