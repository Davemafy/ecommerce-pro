import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastProvider } from './components/ui/feedback';
import { router } from './app/router';
import { StoreProvider } from './data/store';
import './styles.css';
import './mobile-fixes.css';
import './mobile-product-controls.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
        </StoreProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
