import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './app';
import { DashboardPage } from '../features/dashboard/dashboard-page';
import { OrdersPage } from '../features/orders/orders-page';
import { OrderDetailPage } from '../features/orders/order-detail-page';
import { ProductsPage } from '../features/products/products-page';
import { ProductDetailPage } from '../features/products/product-detail-page';
import { CustomersPage } from '../features/customers/customers-page';
import { CustomerDetailPage } from '../features/customers/customer-detail-page';
import { InventoryPage } from '../features/inventory/inventory-page';
import { ReportsPage } from '../features/reports/reports-page';
import { SettingsPage } from '../features/settings/settings-page';
import { RouteErrorPage } from '../components/ui/route-error-page';

function ProductListRoute() {
  return <ProductsPage />;
}

function ProductDetailRoute() {
  return <ProductDetailPage />;
}

function CustomerListRoute() {
  return <CustomersPage />;
}

function CustomerDetailRoute() {
  return <CustomerDetailPage />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },

      {
        path: 'orders',
        children: [
          { index: true, element: <OrdersPage /> },
          { path: ':orderId', element: <OrderDetailPage /> },
        ],
      },

      {
        path: 'products',
        children: [
          { index: true, element: <ProductListRoute /> },
          { path: ':productId', element: <ProductDetailRoute /> },
        ],
      },

      {
        path: 'customers',
        children: [
          { index: true, element: <CustomerListRoute /> },
          { path: ':customerId', element: <CustomerDetailRoute /> },
        ],
      },

      { path: 'inventory', element: <InventoryPage /> },
      { path: 'reports', element: <ReportsPage /> },

      {
        path: 'settings',
        children: [
          { index: true, element: <Navigate to="/settings/general" replace /> },
          { path: ':section', element: <SettingsPage /> },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
