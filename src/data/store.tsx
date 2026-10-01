import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commerceService } from '../services/commerce-service';

const DATA_KEY = ['commerce-data'] as const;

export function StoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useStore() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: DATA_KEY,
    queryFn: commerceService.getData,
    staleTime: 30_000,
    retry: 1,
  });

  const command = useMutation({
    mutationFn: (operation: () => Promise<any>) => operation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DATA_KEY }),
        queryClient.invalidateQueries({ queryKey: ['order'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
        queryClient.invalidateQueries({ queryKey: ['customer'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-history'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['notification-history'] }),
      ]);
    },
  });

  const data = query.data ?? commerceService.referenceData;
  const execute = (operation: () => Promise<any>) => command.mutateAsync(operation);

  const productApiId = (id: string) => {
    const product = data.products.find((item: any) => item.id === id || item.apiId === id);
    return product?.apiId || id;
  };

  const customerApiId = (id: string) => {
    const customer = data.customers.find((item: any) => item.id === id || item.apiId === id);
    return customer?.apiId || id;
  };

  return {
    data,
    addProduct: (product: any) => execute(() => commerceService.createProduct(product)),
    updateProduct: (id: string, patch: any) =>
      execute(() => commerceService.updateProduct(productApiId(id), patch)),
    archiveProduct: (id: string) =>
      execute(() => commerceService.setProductStatus(productApiId(id), 'draft')),
    addCustomer: (customer: any) => execute(() => commerceService.createCustomer(customer)),
    updateCustomer: (id: string, patch: any) =>
      execute(() => commerceService.updateCustomer(customerApiId(id), patch)),
    addCustomerNote: (id: string, note: string) =>
      execute(() => commerceService.addCustomerNote(customerApiId(id), note)),
    createOrder: (order: any) => execute(() => commerceService.createOrder(order, data)),
    updateOrderStatus: (id: string, status: string) =>
      execute(() => commerceService.updateOrderStatus(id, status, data)),
    adjustInventory: (sku: string, amount: number, note?: string) =>
      execute(() => commerceService.adjustInventory(sku, amount, note, data)),
    updateSettings: (section: string, patch: any) => {
      if (section === 'general') return execute(() => commerceService.updateGeneralSettings(patch));
      if (section === 'payments') return execute(() => commerceService.updatePayments(patch.gateways || []));
      if (section === 'notifications') return execute(() => commerceService.updateNotificationSettings(patch));
      return Promise.resolve();
    },
    uploadStoreLogo: (file: File) => execute(() => commerceService.uploadStoreLogo(file)),
    isLoading: query.isLoading,
    error: query.error,
    reload: query.refetch,
    isSaving: command.isPending,
  };
}
