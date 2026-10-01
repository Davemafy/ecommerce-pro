import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, CircleMinus, Flag } from 'lucide-react';
import { ConfirmDialog, Modal, useToast } from '../../components/ui/feedback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { FormFields } from '../../components/ui/form-fields';
import { ProductVisual } from '../../components/ui/product-visual';
import { useStore } from '../../data/store';
import { commerceService } from '../../services/commerce-service';
import { buildPeriodRevenueSeries } from '../../utils/analytics';

type ChartRange = '30D' | '90D' | '1Y';
const rangeLabel: Record<ChartRange, string> = { '30D': 'Last 30 Days', '90D': 'Last 90 Days', '1Y': 'This Year' };

function historyQuantity(entry: any) {
  const value = entry.quantityChange ?? entry.quantity ?? entry.change ?? 0;
  return Number(value) || 0;
}

function historyDate(entry: any) {
  const value = entry.createdAt || entry.date || entry.timestamp;
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const routeId = decodeURIComponent(productId || '');
  const { data, updateProduct, archiveProduct, uploadProductImages, adjustInventory, isSaving } = useStore();
  const listProduct = data.products.find((item: any) => item.id === routeId || item.apiId === routeId);
  const apiId = listProduct?.apiId || routeId;

  const productQuery = useQuery({
    queryKey: ['product', apiId],
    queryFn: () => commerceService.getProductDetail(apiId),
    enabled: Boolean(apiId),
    staleTime: 30_000,
    retry: 1,
  });

  const historyQuery = useQuery({
    queryKey: ['inventory-history', apiId],
    queryFn: () => commerceService.getProductInventoryHistory(apiId),
    enabled: Boolean(apiId),
    staleTime: 30_000,
    retry: false,
  });

  const product: any = productQuery.data || listProduct;
  const inventoryHistory: any[] = historyQuery.data || [];
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

  if (!product && productQuery.isLoading) {
    return <main className="figma-page"><section className="card empty"><h1>Loading product…</h1><p>Fetching the latest catalog record.</p></section></main>;
  }

  if (!product && productQuery.isError) {
    return <main className="figma-page"><section className="card empty"><h1>Couldn't load product</h1><p>{productQuery.error instanceof Error ? productQuery.error.message : 'The product request failed.'}</p><button onClick={() => productQuery.refetch()}>Try again</button></section></main>;
  }

  if (!product) {
    return <main><button className="back" onClick={() => navigate('/products')}><ArrowLeft/>Products</button><section className="card empty"><h1>Product not found</h1><p>This product may have been removed or the link is no longer valid.</p></section></main>;
  }

  const productSales = data.orders.flatMap((order: any) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const matchingItems = items.filter(
      (item: any) => item.sku === product.sku || item.productId === product.apiId || item.productId === product.id,
    );

    if (matchingItems.length) {
      const contribution = matchingItems.reduce(
        (result: { amount: number; quantity: number }, item: any) => {
          const quantity = Number(item.quantity ?? 0);
          const directTotal = item.total == null ? NaN : Number(item.total);
          const unitPrice = item.price == null ? Number(product.price) : Number(item.price);
          const amount = Number.isFinite(directTotal)
            ? directTotal
            : Number.isFinite(unitPrice) && Number.isFinite(quantity)
              ? unitPrice * quantity
              : 0;
          return {
            amount: result.amount + amount,
            quantity: result.quantity + (Number.isFinite(quantity) ? quantity : 0),
          };
        },
        { amount: 0, quantity: 0 },
      );
      return [{ order, ...contribution }];
    }

    if (order.sku === product.sku) {
      return [{
        order,
        amount: Number.isFinite(Number(order.total)) ? Number(order.total) : 0,
        quantity: Number.isFinite(Number(order.quantity)) ? Number(order.quantity) : 0,
      }];
    }

    return [];
  });
  const productOrders = productSales.map(({ order }: any) => order);
  const productRevenue = productSales.reduce((sum: number, sale: any) => sum + sale.amount, 0);
  const productRevenueOrders = productSales.map((sale: any) => ({ ...sale.order, total: sale.amount }));
  const threshold = product.lowStockThreshold == null ? null : Number(product.lowStockThreshold);
  const thresholdCoverage = threshold != null && Number.isFinite(threshold) && threshold > 0
    ? Math.round((product.stock / threshold) * 100)
    : null;
  const chart = buildPeriodRevenueSeries(productRevenueOrders, rangeLabel[range]);
  const maxChart = Math.max(...chart.map((item) => item.value), 1);
  const derivedSoldUnits = productSales.reduce((sum: number, sale: any) => sum + sale.quantity, 0);
  const soldUnits = product.totalSold == null ? derivedSoldUnits : Number(product.totalSold);

  const history = inventoryHistory.map((entry: any, index: number) => ({
    id: entry._id || entry.id || index,
    date: historyDate(entry),
    action: String(entry.type || entry.action || 'adjustment').replaceAll('_', ' '),
    quantity: historyQuantity(entry),
    user: entry.user?.name || entry.adminName || entry.createdBy?.name || '—',
    notes: entry.note || entry.notes || entry.reason || '—',
  }));

  const save = async () => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name?.trim() || !form.category?.trim()) {
      setError('Name and category are required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setError('Price must be non-negative and stock must be a non-negative whole number.');
      return;
    }

    try {
      await updateProduct(product.id, {
        name: form.name.trim(),
        category: form.category.trim(),
        price,
      });
      const stockDelta = stock - Number(product.stock);
      if (stockDelta !== 0) {
        await adjustInventory(product.sku, stockDelta, 'Adjusted from product details');
      }
      if (imageFiles.length) await uploadProductImages(product.id, imageFiles);
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

    <div className="product-bento">
      <section className="card product-overview"><div className="keyboard-photo figma-keyboard-photo"><ProductVisual name={product.name} size="lg" src={product.images?.[0]}/></div><div className="product-copy"><h2>Details</h2><p>{product.description || 'No product description has been added yet.'}</p><div className="detail-facts"><div><span>SKU</span><b className="mono">{product.sku}</b></div><div><span>CATEGORY</span><b>{product.category}</b></div><div><span>PRICE</span><strong>${product.price.toFixed(2)}</strong></div><div><span>CURRENT STOCK</span><b><i className="purple-dot"/>{product.stock} units</b></div></div></div></section>
      <div className="product-side-stack"><section className="card inventory-status"><h2>Inventory Status</h2><div className="capacity-label"><b>Stock vs. reorder point</b><span>{thresholdCoverage == null ? 'Not set' : `${thresholdCoverage}%`}</span></div><div className="capacity-track"><i style={{ width: `${thresholdCoverage == null ? 0 : Math.min(100, thresholdCoverage)}%` }}/></div><div className="mini-label">Catalog</div><div className="location-chips"><span>Available ({product.stock})</span><span>Sold ({soldUnits})</span></div></section><section className="revenue-card"><span>TOTAL REVENUE</span><strong>${productRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><p>{productOrders.length} recorded order{productOrders.length === 1 ? '' : 's'}</p></section></div>
    </div>

    <section className="card sales-card"><div className="sales-head"><h2>Sales Performance</h2><div>{(['30D', '90D', '1Y'] as ChartRange[]).map((item) => <button key={item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item}</button>)}</div></div><div className="sales-chart-area"><div className="y-axis"><span>${maxChart.toFixed(0)}</span><span>${(maxChart * .66).toFixed(0)}</span><span>${(maxChart * .33).toFixed(0)}</span><span>$0</span></div><div className="bars">{chart.map((item, index) => <i key={`${range}-${item.label}-${index}`} style={{ height: item.value ? `${Math.max(4, (item.value / maxChart) * 100)}%` : '0%', opacity: item.value ? 0.45 + index * .08 : .12 }} title={`${item.label}: $${item.value.toFixed(2)}`}/>)}</div></div><div className="x-axis">{chart.filter((_, index) => index === 0 || index === Math.floor(chart.length / 2) || index === chart.length - 1).map((item) => <span key={item.label}>{item.label}</span>)}</div></section>

    <section className="card history-card"><h2>Stock History</h2><div className="history-scroll"><table><thead><tr><th>DATE</th><th>ACTION</th><th>QUANTITY</th><th>USER</th><th>NOTES</th></tr></thead><tbody>{history.map((entry: any) => <tr key={entry.id}><td>{entry.date}</td><td><span className="history-action"><CircleMinus/>{entry.action}</span></td><td className={entry.quantity < 0 ? 'negative' : 'positive'}>{entry.quantity > 0 ? '+' : ''}{entry.quantity}</td><td>{entry.user}</td><td>{entry.notes}</td></tr>)}{historyQuery.isError ? <tr><td colSpan={5}><div className="table-empty-state"><strong>Couldn't load stock history.</strong><span>The inventory history request failed.</span><button onClick={() => historyQuery.refetch()}>Try again</button></div></td></tr> : !history.length && <tr><td colSpan={5}><div className="table-empty-state"><strong>No stock adjustments yet.</strong><span>Inventory history will appear here after the first adjustment.</span></div></td></tr>}</tbody></table></div></section>

    <Modal open={editing} title="Edit product" description="Update catalog details, stock, and product imagery." onClose={() => { setEditing(false); setImageFiles([]); setError(''); }} footer={<><button onClick={() => { setEditing(false); setImageFiles([]); setError(''); }}>Cancel</button><button className="primary" disabled={isSaving} onClick={save}>{isSaving ? 'Saving…' : 'Save changes'}</button></>}><FormFields values={form} onChange={(name, value) => { setError(''); setForm((current) => ({ ...current, [name]: value })); }} fields={[{ name: 'name', label: 'Product name', required: true }, { name: 'category', label: 'Category', required: true }, { name: 'price', label: 'Price', type: 'number', required: true, min: 0, step: '0.01', inputMode: 'decimal' }, { name: 'stock', label: 'Stock quantity', type: 'number', required: true, min: 0, step: 1, inputMode: 'numeric' }]}/><label className="modal-file-field">Product images<input type="file" accept="image/*" multiple onChange={(event) => setImageFiles(Array.from(event.target.files || []))}/><small>{imageFiles.length ? `${imageFiles.length} image${imageFiles.length === 1 ? '' : 's'} selected` : 'Optional. Existing images are kept.'}</small></label>{error && <p className="form-error">{error}</p>}</Modal>
    <ConfirmDialog open={archiving} title="Move this product to draft?" description="The product remains in the catalog but is no longer active." confirmLabel="Move to draft" danger onClose={() => setArchiving(false)} onConfirm={archive}/>
  </main>;
}
