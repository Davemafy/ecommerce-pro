import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commerceService } from '../services/commerce-service';

const DATA_KEY = ['commerce-data'] as const;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useStore() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: DATA_KEY, queryFn: commerceService.getData, staleTime: Infinity });
  const mutate = useMutation({
    mutationFn: commerceService.replaceData,
    onSuccess: (next) => queryClient.setQueryData(DATA_KEY, next),
  });
  const data = query.data ?? commerceService.referenceData;
  const commit = (updater: any) => {
    const next = typeof updater === 'function' ? updater(data) : updater;
    queryClient.setQueryData(DATA_KEY, next);
    mutate.mutate(next);
  };
  return {
    data,
    addProduct(product: any) { commit((d: any) => ({ ...d, products: [{ ...product, id: product.sku }, ...d.products] })); },
    updateProduct(id: string, patch: any) { commit((d: any) => ({ ...d, products: d.products.map((p: any) => p.id === id ? { ...p, ...patch } : p) })); },
    archiveProduct(id: string) { commit((d: any) => ({ ...d, products: d.products.map((p: any) => p.id === id ? { ...p, status: 'Archived' } : p) })); },
    addCustomer(customer: any) { commit((d: any) => ({ ...d, customers: [{ ...customer, id: crypto.randomUUID(), status: 'Active' }, ...d.customers] })); },
    createOrder(order: any) {
      const customer = data.customers.find((c: any) => c.email === order.email);
      const product = data.products.find((p: any) => p.sku === order.sku);
      const qty = Number(order.quantity);
      if (!customer) throw new Error('Choose an existing customer email.');
      if (!product) throw new Error('Choose an existing product SKU.');
      if (!Number.isFinite(qty) || qty < 1) throw new Error('Quantity must be at least 1.');
      if (product.stock < qty) throw new Error('Not enough stock is available.');
      const created = { id: `ORD-${1009 + data.orders.length}`, customerId: customer.id, customer: customer.name, date: new Date().toISOString().slice(0, 10), total: product.price * qty, status: 'Pending', sku: product.sku, quantity: qty };
      commit((d: any) => ({ ...d, orders: [created, ...d.orders], products: d.products.map((p: any) => p.id === product.id ? { ...p, stock: p.stock - qty } : p) }));
    },
    adjustInventory(sku: string, amount: number) { commit((d: any) => ({ ...d, products: d.products.map((p: any) => p.sku === sku ? { ...p, stock: Math.max(0, p.stock + Number(amount)) } : p) })); },
    updateSettings(section: string, patch: any) { commit((d: any) => ({ ...d, settings: { ...d.settings, [section]: { ...d.settings[section], ...patch } } })); },
    resetDemoData() { queryClient.setQueryData(DATA_KEY, commerceService.referenceData); },
    isLoading: query.isLoading,
  };
}
