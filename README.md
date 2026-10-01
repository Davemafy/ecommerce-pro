# CommercePro Admin

Client-facing React + TypeScript ecommerce administration frontend connected to the Ecommerce Admin API.

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

The production API base URL is configured through `VITE_API_BASE_URL`. Authentication uses the backend login/refresh/logout contract, bearer access tokens in memory, and the backend's authentication cookies.

## Quality gates

```bash
npm run format:check
npm run lint
npm run test
npm run build
# or all checks:
npm run check
```

## Structure

- `src/app` — application composition and routing
- `src/api` — HTTP client, API contract paths and services
- `src/components/layout` — application shell
- `src/components/ui` — reusable presentation and feedback primitives
- `src/features/*` — feature-owned screens and behavior
- `src/data` — TanStack Query compatibility layer for shared server data
- `src/services` — API-to-UI normalization and mutation orchestration

## API integration

The frontend is wired to the documented admin API for authentication, dashboard metrics, orders, products, product images, customers, inventory, analytics, notifications, store settings, payment gateways, team administration, password changes and two-factor authentication.

The current backend contract does not expose a delete-store endpoint, so the destructive store-delete control is intentionally disabled rather than simulated.
