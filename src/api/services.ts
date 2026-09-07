import { api } from './client';
import { endpoints } from './endpoints';

const withQuery = (path, query) =>
  query ? `${path}?${new URLSearchParams(query).toString()}` : path;

export const dashboardService = { getOverview: () => api.get(endpoints.dashboard) };
export const orderService = {
  list: (query) => api.get(withQuery(endpoints.orders, query)),
  get: (id) => api.get(endpoints.order(id)),
  create: (data) => api.post(endpoints.orders, data),
  update: (id, data) => api.patch(endpoints.order(id), data),
};
export const productService = {
  list: (query) => api.get(withQuery(endpoints.products, query)),
  get: (id) => api.get(endpoints.product(id)),
  create: (data) => api.post(endpoints.products, data),
  update: (id, data) => api.patch(endpoints.product(id), data),
  remove: (id) => api.delete(endpoints.product(id)),
};
export const customerService = {
  list: (query) => api.get(withQuery(endpoints.customers, query)),
  get: (id) => api.get(endpoints.customer(id)),
  create: (data) => api.post(endpoints.customers, data),
  update: (id, data) => api.patch(endpoints.customer(id), data),
};
export const inventoryService = {
  list: () => api.get(endpoints.inventory),
  adjust: (id, data) => api.patch(endpoints.inventoryItem(id), data),
};
export const reportService = {
  overview: (query) => api.get(withQuery(endpoints.reports, query)),
};
export const settingsService = {
  get: () => api.get(endpoints.settings),
  update: (data) => api.patch(endpoints.settings, data),
};
