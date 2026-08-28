# CommercePro Admin Dashboard

A responsive ecommerce operations dashboard implemented from a multi-screen Figma flow.

## What is implemented
- Shared application shell and reusable sidebar navigation
- Dashboard KPIs, revenue visualization, inventory alerts and recent orders
- Orders management screen with client-side search and fulfillment-status filtering
- Reusable status badge and KPI components
- Responsive desktop/tablet/mobile behavior
- Accessible navigation, tab state, labels and semantic table markup

## Structure
`components/layout` contains persistent application chrome.
`components/ui` contains reusable presentation components.
`features/dashboard` and `features/orders` keep page-specific logic isolated.
`data` contains prototype fixtures and can be replaced by an API layer.

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## Engineering notes
The prototype deliberately separates data, layout, reusable UI and feature-level components so API integration can be introduced without rewriting the view layer. Order filtering is derived with `useMemo` rather than storing duplicated filtered state.
