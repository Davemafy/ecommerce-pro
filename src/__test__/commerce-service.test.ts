import { describe, expect, it } from 'vitest';
import { endpoints } from '../api/endpoints';
import { withQuery } from '../api/services';
import { normalizeCustomer, normalizeOrder } from '../services/commerce-service';

describe('ecommerce admin API contract', () => {
  it('uses the documented v1 admin routes', () => {
    expect(endpoints.auth.superAdminStatus).toBe('/api/v1/admin/auth/super-admin/status');
    expect(endpoints.auth.superAdmin).toBe('/api/v1/admin/auth/super-admin');
    expect(endpoints.auth.login).toBe('/api/v1/admin/auth/login');
    expect(endpoints.dashboard).toBe('/api/v1/admin/dashboard');
    expect(endpoints.orders).toBe('/api/v1/admin/orders');
    expect(endpoints.products).toBe('/api/v1/admin/products');
    expect(endpoints.customers).toBe('/api/v1/admin/customers');
    expect(endpoints.inventory).toBe('/api/v1/admin/inventory');
    expect(endpoints.analytics).toBe('/api/v1/admin/analytics');
  });

  it('serializes only meaningful query values', () => {
    expect(withQuery(endpoints.products, { page: 2, search: 'keyboard', status: undefined }))
      .toBe('/api/v1/admin/products?page=2&search=keyboard');
  });

  it('preserves real zero customer aggregates', () => {
    const customer = normalizeCustomer({ _id: 'c1', name: 'A', email: 'a@example.com', totalOrders: 0, totalSpent: 0 });
    expect(customer.totalOrders).toBe(0);
    expect(customer.totalSpent).toBe(0);
  });

  it('does not invent optional order totals', () => {
    const order = normalizeOrder({ _id: 'o1', orderNumber: 'ORD-1', total: 10, fulfillmentStatus: 'pending', items: [] });
    expect(order.subtotal).toBeNull();
    expect(order.tax).toBeNull();
    expect(order.shipping).toBeNull();
    expect(order.discount).toBeNull();
    expect(order.status).toBe('Pending');
  });
});
