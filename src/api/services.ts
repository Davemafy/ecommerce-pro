import { api, clearAccessToken, setAccessToken } from './client';
import { endpoints } from './endpoints';

export type Query = Record<string, string | number | boolean | null | undefined>;

export const unwrapData = <T = any>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response) return response.data as T;
  return response as T;
};

export const unwrapList = <T = any>(response: any, candidates: string[] = []): T[] => {
  const data: any = unwrapData(response);
  if (Array.isArray(data)) return data;
  for (const key of candidates) if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const withQuery = (path: string, query?: Query) => {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};

export const authService = {
  superAdminStatus: () => api.get(endpoints.auth.superAdminStatus),
  createSuperAdmin: (data: { name: string; email: string; password: string }) =>
    api.post(endpoints.auth.superAdmin, data),
  async login(credentials: { email: string; password: string }) {
    const response: any = await api.post(endpoints.auth.login, credentials);
    const data: any = unwrapData(response);
    if (data?.accessToken) setAccessToken(data.accessToken);
    return data;
  },
  async refresh() {
    const response: any = await api.post(endpoints.auth.refresh);
    const data: any = unwrapData(response);
    if (data?.accessToken) setAccessToken(data.accessToken);
    return data;
  },
  me: () => api.get(endpoints.auth.me),
  async logout() {
    try {
      await api.post(endpoints.auth.logout);
    } finally {
      clearAccessToken();
    }
  },
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch(endpoints.auth.changePassword, { currentPassword, newPassword }),
  setTwoFactor: (enabled: boolean) => api.patch(endpoints.auth.twoFactor, { enabled }),
  permissions: () => api.get(endpoints.auth.permissions),
  team: () => api.get(endpoints.auth.team),
  createTeamMember: (data: any) => api.post(endpoints.auth.team, data),
  updateTeamMember: (id: string, data: any) => api.patch(endpoints.auth.teamMember(id), data),
  deleteTeamMember: (id: string) => api.delete(endpoints.auth.teamMember(id)),
};

export const dashboardService = {
  getOverview: (range: '7d' | '30d' | '90d' = '30d') =>
    api.get(withQuery(endpoints.dashboard, { range })),
};

export const orderService = {
  list: (query?: Query) => api.get(withQuery(endpoints.orders, query)),
  get: (id: string) => api.get(endpoints.order(id)),
  create: (data: any) => api.post(endpoints.orders, data),
  updateStatus: (id: string, data: any) => api.patch(endpoints.orderStatus(id), data),
  addNote: (id: string, note: string) => api.post(endpoints.orderNotes(id), { note }),
  refund: (id: string, data: { amount?: number; reason?: string }) =>
    api.post(endpoints.orderRefund(id), data),
  remove: (id: string) => api.delete(endpoints.order(id)),
  bulk: (ids: string[], action: 'mark_shipped' | 'cancel') =>
    api.patch(endpoints.orderBulk, { ids, action }),
};

export const productService = {
  list: (query?: Query) => api.get(withQuery(endpoints.products, query)),
  get: (id: string) => api.get(endpoints.product(id)),
  create: (data: any) => api.post(endpoints.products, data),
  update: (id: string, data: any) => api.patch(endpoints.product(id), data),
  remove: (id: string) => api.delete(endpoints.product(id)),
  bulkStatus: (ids: string[], status: 'active' | 'draft' | 'out_of_stock') =>
    api.patch(endpoints.productBulkStatus, { ids, status }),
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return api.post(endpoints.productImages(id), form);
  },
  removeImage: (id: string, imageUrl: string) =>
    api.delete(endpoints.productImages(id), { imageUrl }),
};

export const customerService = {
  list: (query?: Query) => api.get(withQuery(endpoints.customers, query)),
  get: (id: string) => api.get(endpoints.customer(id)),
  create: (data: any) => api.post(endpoints.customers, data),
  update: (id: string, data: any) => api.patch(endpoints.customer(id), data),
  remove: (id: string) => api.delete(endpoints.customer(id)),
  block: (id: string, blocked: boolean) => api.patch(endpoints.customerBlock(id), { blocked }),
  addNote: (id: string, note: string) => api.post(endpoints.customerNotes(id), { note }),
};

export const inventoryService = {
  list: (query?: Query) => api.get(withQuery(endpoints.inventory, query)),
  history: (query?: Query) => api.get(withQuery(endpoints.inventoryHistory, query)),
  productHistory: (id: string) => api.get(endpoints.productInventoryHistory(id)),
  restock: (id: string, quantity: number, note?: string) =>
    api.post(endpoints.inventoryRestock(id), { quantity, note }),
  adjust: (id: string, quantityChange: number, type = 'adjustment', note?: string) =>
    api.post(endpoints.inventoryAdjust(id), { quantityChange, type, note }),
};

export const analyticsService = {
  overview: (query?: Query) => api.get(withQuery(endpoints.analytics, query)),
  export: (query?: Query) => api.get(withQuery(endpoints.analyticsExport, query)),
};

export const notificationService = {
  settings: () => api.get(endpoints.notifications.settings),
  updateAll: (data: any) => api.put(endpoints.notifications.settings, data),
  updateEvent: (eventType: string, data: any) =>
    api.patch(endpoints.notifications.event(eventType), data),
  history: (query?: Query) => api.get(withQuery(endpoints.notifications.history, query)),
  readAll: () => api.patch(endpoints.notifications.readAll),
  read: (id: string) => api.patch(endpoints.notifications.read(id)),
};

export const settingsService = {
  getAll: () => api.get(endpoints.settings.all),
  getStore: () => api.get(endpoints.settings.store),
  updateStore: (data: any) => api.put(endpoints.settings.store, data),
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('images', file);
    return api.post(endpoints.settings.storeLogo, form);
  },
  getPayments: () => api.get(endpoints.settings.payments),
  updatePayments: (gateways: any[]) => api.put(endpoints.settings.payments, { gateways }),
  setGatewayEnabled: (gateway: string, enabled: boolean) =>
    api.patch(endpoints.settings.paymentGateway(gateway), { enabled }),
  getShipping: () => api.get(endpoints.settings.shipping),
  updateShipping: (data: any) => api.put(endpoints.settings.shipping, data),
};
