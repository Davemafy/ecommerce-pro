# CommercePro Admin Dashboard

Responsive React implementation of the CommercePro multi-screen Figma flow.

## Implemented
- Dashboard overview matched to the source Figma layout and visual tokens
- Orders management view with search and fulfillment filtering
- Shared application shell and navigation
- Reusable KPI and status components
- Responsive desktop, tablet and mobile behavior
- Semantic tables and accessible navigation controls

## Architecture
- `components/layout` — persistent application shell
- `components/ui` — reusable presentation primitives
- `features/dashboard` — overview-specific components
- `features/orders` — order-management state and UI
- `data` — prototype fixtures, isolated for later API replacement

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
