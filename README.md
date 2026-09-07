# CommercePro Admin

Client-facing React/Vite ecommerce administration frontend.

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Quality gates

```bash
npm run format
npm run lint
npm run build
# or all checks:
npm run check
```

## Structure

- `src/app` — application composition/navigation
- `src/api` — HTTP client, endpoint definitions and services
- `src/components/layout` — application layout
- `src/components/ui` — reusable presentation/feedback primitives
- `src/features/*` — feature-owned pages and behavior
- `src/data` — temporary mock data only

The backend endpoint contract is centralized under `src/api`. Mock data is temporary and should be removed as each real endpoint is integrated.


## JAM-Forte architecture pass
The existing CommercePro UI and interactions are preserved. The codebase is migrated in place to TypeScript/kebab-case, React Router, TanStack Query for domain state, Redux Toolkit for global UI state, and a replaceable service boundary. No customer/order PII is persisted to browser storage.
