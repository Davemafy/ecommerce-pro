import {
  analyticsService,
  customerService,
  dashboardService,
  inventoryService,
  notificationService,
  orderService,
  productService,
  settingsService,
  unwrapData,
  unwrapList,
} from '../api/services';

const emptySettings = {
  general: {
    storeName: '',
    contactEmail: '',
    contactPhone: '',
    currency: 'USD',
    timezone: 'UTC',
    logoName: '',
    logoData: '',
    address: {},
  },
  team: { members: [] as any[] },
  payments: { gateways: [] as any[] },
  notifications: { masterPushEnabled: true, preferences: [] as any[] },
  security: { twoFactor: false },
};

export const emptyCommerceData = {
  products: [] as any[],
  customers: [] as any[],
  orders: [] as any[],
  dashboard: null as any,
  analytics: null as any,
  settings: structuredClone(emptySettings),
};

const titleCase = (value = '') =>
  value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const productStatus = (value?: string) => {
  if (value === 'active') return 'Active';
  if (value === 'draft') return 'Draft';
  if (value === 'out_of_stock') return 'Out of Stock';
  return value ? titleCase(value) : 'Unknown';
};

const fulfillmentStatus = (value?: string) => {
  if (value === 'delivered') return 'Completed';
  if (value === 'shipped') return 'Shipped';
  if (value === 'processing') return 'Processing';
  if (value === 'cancelled') return 'Cancelled';
  if (value === 'refunded') return 'Refunded';
  return value ? titleCase(value) : 'Unknown';
};

export function normalizeProduct(raw: any) {
  return {
    ...raw,
    id: raw?._id || raw?.id || raw?.sku,
    apiId: raw?._id || raw?.id,
    name: raw?.name || 'Unnamed product',
    description: raw?.description || '',
    sku: raw?.sku || '',
    category: raw?.category || 'Uncategorized',
    price: Number(raw?.price || 0),
    compareAtPrice: raw?.compareAtPrice == null ? null : Number(raw.compareAtPrice),
    stock: Number(raw?.stock || 0),
    lowStockThreshold: raw?.lowStockThreshold == null ? null : Number(raw.lowStockThreshold),
    status: productStatus(raw?.status),
    images: Array.isArray(raw?.images) ? raw.images : [],
    variants: Array.isArray(raw?.variants) ? raw.variants : [],
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    totalSold: raw?.totalSold == null ? null : Number(raw.totalSold),
  };
}

function addressText(address: any) {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [
    address.street || address.address1 || address.line1,
    address.city,
    address.state || address.region,
    address.postalCode || address.zip,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

export function normalizeCustomer(raw: any) {
  const addresses = Array.isArray(raw?.addresses) ? raw.addresses : [];
  return {
    ...raw,
    id: raw?._id || raw?.id || raw?.email,
    apiId: raw?._id || raw?.id,
    name: raw?.name || 'Unnamed customer',
    email: raw?.email || '',
    phone: raw?.phone || '',
    status: raw?.status === 'blocked' ? 'Blocked' : raw?.status === 'active' ? 'Active' : raw?.status ? titleCase(raw.status) : 'Unknown',
    addresses,
    address: addressText(addresses[0] || raw?.address),
    totalOrders: raw?.totalOrders == null ? null : Number(raw.totalOrders),
    totalSpent: raw?.totalSpent == null ? null : Number(raw.totalSpent),
  };
}

export function normalizeOrder(raw: any) {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const first = items[0] || {};
  const orderNumber = raw?.orderNumber || raw?.id || raw?._id || '';
  return {
    ...raw,
    id: orderNumber,
    apiId: raw?._id || raw?.id || orderNumber,
    customerId: raw?.customerId || raw?.customer?._id || raw?.customer?.id || '',
    customer: raw?.customerName || raw?.customer?.name || 'Unknown customer',
    customerEmail: raw?.customerEmail || raw?.customer?.email || '',
    date: raw?.createdAt || raw?.date || raw?.updatedAt || '',
    total: Number(raw?.total || 0),
    subtotal: Number(raw?.subtotal || 0),
    tax: Number(raw?.tax || 0),
    shipping: Number(raw?.shipping || 0),
    discount: Number(raw?.discount || 0),
    paymentStatus: raw?.paymentStatus || 'unknown',
    paymentMethod: raw?.paymentMethod || '',
    fulfillmentStatus: raw?.fulfillmentStatus || 'unknown',
    status: fulfillmentStatus(raw?.fulfillmentStatus),
    sku: first?.sku || first?.productSku || first?.variantSku || '',
    quantity: Number(first?.quantity ?? raw?.itemCount ?? 0),
    items,
    timeline: Array.isArray(raw?.timeline) ? raw.timeline : [],
    shippingAddress: raw?.shippingAddress || null,
    billingAddress: raw?.billingAddress || null,
  };
}

function normalizeStore(response: any) {
  const raw: any = unwrapData(response) || {};
  return {
    storeName: raw.name || raw.storeName || '',
    contactEmail: raw.contactEmail || '',
    contactPhone: raw.contactPhone || '',
    currency: raw.currency || 'USD',
    timezone: raw.timezone || 'UTC',
    address: raw.address || {},
    logoName: '',
    logoData: raw.logo || raw.logoUrl || raw.image || '',
  };
}

function normalizePayments(response: any) {
  const raw: any = unwrapData(response) || {};
  const gateways = Array.isArray(raw) ? raw : Array.isArray(raw.gateways) ? raw.gateways : [];
  return { gateways };
}

function normalizeNotifications(response: any) {
  const raw: any = unwrapData(response) || {};
  return {
    masterPushEnabled: raw.masterPushEnabled ?? true,
    preferences: Array.isArray(raw.preferences) ? raw.preferences : [],
  };
}

async function optional<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function createProductPayload(product: any) {
  return {
    name: product.name,
    description: product.description || '',
    sku: product.sku,
    category: product.category,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice == null ? undefined : Number(product.compareAtPrice),
    stock: Number(product.stock || 0),
    tags: Array.isArray(product.tags) ? product.tags : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
    status:
      product.status === 'Active'
        ? 'active'
        : product.status === 'Out of Stock'
          ? 'out_of_stock'
          : 'draft',
  };
}

function updateProductPayload(patch: any) {
  const payload: any = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.sku !== undefined) payload.sku = patch.sku;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.price !== undefined) payload.price = Number(patch.price);
  if (patch.compareAtPrice !== undefined) payload.compareAtPrice = patch.compareAtPrice == null ? null : Number(patch.compareAtPrice);
  if (patch.stock !== undefined) payload.stock = Number(patch.stock);
  if (patch.tags !== undefined) payload.tags = patch.tags;
  if (patch.variants !== undefined) payload.variants = patch.variants;
  if (patch.status !== undefined) {
    payload.status =
      patch.status === 'Active'
        ? 'active'
        : patch.status === 'Out of Stock'
          ? 'out_of_stock'
          : 'draft';
  }
  return payload;
}

export const commerceService = {
  referenceData: structuredClone(emptyCommerceData),

  async getData() {
    const [productsResponse, customersResponse, ordersResponse] = await Promise.all([
      productService.list({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
      customerService.list({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
      orderService.list({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
    ]);

    const [storeResponse, paymentsResponse, notificationsResponse, dashboardResponse, analyticsResponse] =
      await Promise.all([
        optional(settingsService.getStore(), null),
        optional(settingsService.getPayments(), null),
        optional(notificationService.settings(), null),
        optional(dashboardService.getOverview('30d'), null),
        optional(analyticsService.overview({ range: '30d' }), null),
      ]);

    return {
      products: unwrapList(productsResponse, ['products']).map(normalizeProduct),
      customers: unwrapList(customersResponse, ['customers']).map(normalizeCustomer),
      orders: unwrapList(ordersResponse, ['orders']).map(normalizeOrder),
      dashboard: dashboardResponse ? unwrapData(dashboardResponse) : null,
      analytics: analyticsResponse ? unwrapData(analyticsResponse) : null,
      settings: {
        ...structuredClone(emptySettings),
        general: storeResponse ? normalizeStore(storeResponse) : structuredClone(emptySettings.general),
        payments: paymentsResponse ? normalizePayments(paymentsResponse) : structuredClone(emptySettings.payments),
        notifications: notificationsResponse
          ? normalizeNotifications(notificationsResponse)
          : structuredClone(emptySettings.notifications),
      },
    };
  },

  async getProductDetail(id: string) {
    const response: any = await productService.get(id);
    const raw: any = unwrapData(response) || {};
    return normalizeProduct(raw.product || raw);
  },

  async getOrderDetail(id: string) {
    const response: any = await orderService.get(id);
    const raw: any = unwrapData(response) || {};
    return normalizeOrder(raw.order || raw);
  },

  async getCustomerDetail(id: string) {
    const response: any = await customerService.get(id);
    const raw: any = unwrapData(response) || {};
    const profile = raw.customer || raw.profile || raw;
    const customer = normalizeCustomer(profile);
    const detailOrders = Array.isArray(raw.orders) ? raw.orders.map(normalizeOrder) : [];
    return {
      ...customer,
      detailOrders,
      refunds: Array.isArray(raw.refunds) ? raw.refunds : Array.isArray(profile.refunds) ? profile.refunds : [],
      notes: Array.isArray(raw.notes) ? raw.notes : Array.isArray(profile.notes) ? profile.notes : [],
    };
  },

  async getProductInventoryHistory(id: string) {
    const response: any = await inventoryService.productHistory(id);
    return unwrapList(response, ['history', 'adjustments']);
  },

  createProduct(product: any) {
    return productService.create(createProductPayload(product));
  },

  updateProduct(id: string, patch: any) {
    return productService.update(id, updateProductPayload(patch));
  },

  setProductStatus(id: string, status: 'active' | 'draft' | 'out_of_stock') {
    return productService.update(id, { status });
  },

  uploadProductImages(id: string, files: File[]) {
    return productService.uploadImages(id, files);
  },

  createCustomer(customer: any) {
    return customerService.create({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || undefined,
      addresses: Array.isArray(customer.addresses) ? customer.addresses : [],
    });
  },

  updateCustomer(id: string, patch: any) {
    return customerService.update(id, patch);
  },

  addCustomerNote(id: string, note: string) {
    return customerService.addNote(id, note);
  },

  createOrder(order: any, data: any) {
    const customer = data.customers.find(
      (item: any) => item.email.toLowerCase() === String(order.email).trim().toLowerCase(),
    );
    const product = data.products.find(
      (item: any) => item.sku.toLowerCase() === String(order.sku).trim().toLowerCase(),
    );
    const quantity = Number(order.quantity);

    if (!customer) throw new Error('Choose an existing customer email.');
    if (!product) throw new Error('Choose an existing product SKU.');
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be a whole number of at least 1.');
    if (product.stock < quantity) throw new Error('Not enough stock is available.');

    const subtotal = product.price * quantity;
    return orderService.create({
      customerId: customer.apiId || customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: [
        {
          productId: product.apiId || product.id,
          name: product.name,
          sku: product.sku,
          quantity,
          price: product.price,
          total: subtotal,
        },
      ],
      subtotal,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: subtotal,
      shippingAddress: customer.addresses?.[0] || undefined,
      billingAddress: customer.addresses?.[0] || undefined,
    });
  },

  updateOrderStatus(id: string, status: string, data: any) {
    const order = data.orders.find((item: any) => item.id === id || item.apiId === id);
    const apiId = order?.apiId || id;
    const map: Record<string, string> = {
      Pending: 'pending',
      Processing: 'processing',
      Shipped: 'shipped',
      Completed: 'delivered',
      Cancelled: 'cancelled',
      Refunded: 'refunded',
    };
    return orderService.updateStatus(apiId, { fulfillmentStatus: map[status] || status.toLowerCase() });
  },

  async adjustInventory(sku: string, amount: number, note: string | undefined, data: any) {
    const product = data.products.find((item: any) => item.sku === sku);
    if (!product) throw new Error('Product not found.');
    return inventoryService.adjust(product.apiId || product.id, Number(amount), 'adjustment', note);
  },

  updateGeneralSettings(patch: any) {
    return settingsService.updateStore({
      name: patch.storeName,
      contactEmail: patch.contactEmail,
      contactPhone: patch.contactPhone,
      currency: patch.currency,
      timezone: patch.timezone,
      address: patch.address,
    });
  },

  uploadStoreLogo(file: File) {
    return settingsService.uploadLogo(file);
  },

  updatePayments(gateways: any[]) {
    return settingsService.updatePayments(gateways);
  },

  updateNotificationSettings(payload: any) {
    return notificationService.updateAll(payload);
  },
};
