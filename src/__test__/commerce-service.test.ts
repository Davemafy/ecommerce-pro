import { describe, expect, it } from 'vitest';
import { endpoints } from '../api/endpoints';
import { withQuery } from '../api/services';

describe('ecommerce admin API contract', () => {
  it('uses the documented v1 admin routes', () => {
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
});
