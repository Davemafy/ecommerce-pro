import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, CircleMinus, Flag } from 'lucide-react';
import { ConfirmDialog, Modal, useToast } from '../../components/ui/feedback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { FormFields } from '../../components/ui/form-fields';
import { ProductVisual } from '../../components/ui/product-visual';
import { productService } from '../../api/services';
import { useStore } from '../../data/store';
import { buildPeriodRevenueSeries } from '../../utils/analytics';

type ChartRange = '30D' | '90D' | '1Y';
const rangeLabel: Record<ChartRange, string> = { '30D': 'Last 30 Days', '90D': 'Last 90 Days', '1Y': 'This Year' };

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data, updateProduct, archiveProduct, reload, isSaving } = useStore();
  const product = data.products.find((item: any) => item.id === decodeURIComponent(productId || ''));
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [range, setRange] = useState<ChartRange>('30D');
  const [form, setForm] = useState<{ name?: string; price?: number; stock?: number; category?: string }>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (product) setForm({ name: product.name, price: product.price, stock: product.stock, category: product.category });
  }, [product]);

  if (!product) return <main><button className="back" onClick={() => navigate('/products')}><ArrowLeft/>Products</button><section className="card empty"><h1>Product not found</h1><p>This product may have been removed or the link is no longer valid.</p></section></main>;

  const productOrders = data.orders.filter((order: any) => order.sku === product.sku || order.items?.some((item: any) => item.sku === product.sku || item.productId === product.apiId));
  const productRevenue = productOrders.reduce((sum: number, order: any) => sum + order.total, 0);
  const capacity = Math.min(100, Math.max(8, Math.round((product.stock / Math.max(50, product.stock)) * 100)));
  const warehouseA = Math.ceil(product.stock * .35);
  const warehouseB = Math.max(0, product.stock - warehouseA);
  const chart = buildPeriodRevenueSeries(productOrders, rangeLabel[range]);
  const maxChart = Math.max(...chart.map((item) => item.value), 1);
  const soldUnits = product.totalSold || productOrders.reduce((sum: number, order: any) => sum + Number(order.quantity || 0), 0);
  const history = [...productOrders].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((order: any) => ({ date: order.date, action: 'Order fulfilled', quantity: -Number(order.quantity || 1), user: 'CommercePro', notes: `#${order.id}` }));
  const initialStock = product.stock + soldUnits;

  const save = async () => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name?.trim() || !form.category?.trim()) {
      setError('Name and category are required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      setError('Price and stock must be valid non-negative numbers.');
      return;
    }

    try {
      await updateProduct(product.id, { ...form, name: form.name.trim(), category: form.category.trim(), price, stock });
      if (imageFiles.length) {
        await productService.uploadImages(product.apiId || product.id, imageFiles);
        await reload();
      }
      setEditing(false);
      setImageFiles([]);
      setError('');
      toast('Product changes saved');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save product changes.');
    }
  };

  const archive = async () => {
    try {
      await archiveProduct(product.id);
      setArchiving(false);
      toast('Product moved to draft');
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : 'Could not update product', 'error');
    }
  };

  return <main className="figma-page product-detail-page">
    <div className="product-detail-heading"><div className="product-title"><button className="bare product-back" onClick={() => navigate('/products')} aria-label="Back to products"><ArrowLeft/></button><h1>{product.name}</h1><span className={`active-badge ${product.status.toLowerCase().replaceAll(' ', '-')}`}>{product.status}</span></div><DropdownMenu><DropdownMenuTrigger asChild><button>Actions <ChevronDown/></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setEditing(true)}>Edit product</DropdownMenuItem>{product.status === 'Active' && <DropdownMenuItem onSelect={() => setArchiving(true)}>Move to draft</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></div>
    <div className="product-bento"><section className="card product-overview"><div className="keyboard-photo figma-keyboard-photo"><ProductVisual name={product.name} size="lg" src={product.images?.[0]}/></div><div className="product-copy"><h2>Details</h2><p>{product.description || 'No product description has been added yet.'}</p><div className="detail-facts"><div><span>SKU</span><b className="mono">{product.sku}</b></div><div><span>CATEGORY</span><b>{product.category}</b></div><div><span>PRICE</span><strong>${product.price.toFixed(2)}</strong></div><div><span>CURRENT STOCK</span><b><i className="purple-dot"/>{product.stock} units</b></div></div></div></section><div className="product-side-stack"><section className="card inventory-status"><h2>Inventory Status</h2><div className="capacity-label"><b>Fulfillment Capacity</b><span>{capacity}%</span></div><div className="capacity-track"><i style={{ width: `${capacity}%` }}/></div><div className="mini-label">Stock</div><div className="location-chips"><span>Available ({product.stock})</span><span>Sold ({soldUnits})</span></div></section><section className="revenue-card"><span>TOTAL REVENUE</span><strong>${productRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><p>{productOrders.length} recorded order{productOrders.length === 1 ? '' : 's'}</p></section></div></div>
    <section className="card sales-card"><div className="sales-head"><h2>Sales Performance</h2><div>{(['30D', '90D', '1Y'] as ChartRange[]).map((item) => <button key={item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}</button>)}</div></div><div className="sales-chart-area"><div className="y-axis"><span>${maxChart.toFixed(0)}</span><span>${(maxChart * .66).toFixed(0)}</span><span>${(maxChart * .33).toFixed(0)}</span><span>$0</span></div><div className="bars">{chart.map((item, index) => <i key={`${range}-${item.label}-${index}`} style={{ height: `${Math.max(4, (item.value / maxChart) * 100)}%`, opacity: item.value ? 0.45 + index * .08 : .12 }} title={`${item.label}: $${item.value.toFixed(2)}`}/>)}</div></div><div className="x-axis">{chart.filter((_, index) => index === 0 || index === Math.floor(chart.length / 2) || index === chart.length - 1).map((item) => <span key={item.label}>{item.label}</span>)}</div></section>
    <section className="card history-card"><h2>Stock History</h2><div className="history-scroll"><table><thead><tr><th>DATE</th><th>ACTION</th><th>QUANTITY</th><th>USER</th><th>NOTES</th></tr></thead><tbody>{history.map((entry: any) => <tr key={entry.notes}><td>{entry.date ? new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td><td><span className="history-action"><CircleMinus/>{entry.action}</span></td><td className="negative">{entry.quantity}</td><td>{entry.user}</td><td>{entry.notes}</td></tr>)}<tr><td>Catalog baseline</td><td className="linkish"><span className="history-action"><Flag/>Initial stock</span></td><td><b>+{initialStock}</b></td><td>System</td><td>Current catalog record</td></tr></tbody></table></div></section>
    <Modal open={editing} title="Edit product" description="Update catalog details, stock, and product imagery." onClose={() => { setEditing(false); setImageFiles([]); setError(''); }} footer={<><button onClick={() => { setEditing(false); setImageFiles([]); setError(''); }}>Cancel</button><button className="primary" disabled={isSaving} onClick={save}>{isSaving ? 'Saving…' : 'Save changes'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'name', label: 'Product name', required: true }, { name: 'category', label: 'Category', required: true }, { name: 'price', label: 'Price', type: 'number', required: true }, { name: 'stock', label: 'Stock quantity', type: 'number', required: true }]}/><label className="modal-file-field">Product images<input type="file" accept="image/*" multiple onChange={(event) => setImageFiles(Array.from(event.target.files || []))}/><small>{imageFiles.length ? `${imageFiles.length} image${imageFiles.length === 1 ? '' : 's'} selected` : 'Optional. Existing images are kept.'}</small></label>{error && <p className="form-error">{error}</p>}</Modal>
    <ConfirmDialog open={archiving} title="Move this product to draft?" description="The product remains in the catalog but is no longer active." confirmLabel="Move to draft" danger onClose={() => setArchiving(false)} onConfirm={archive}/>
  </main>;
}
