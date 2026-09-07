# ADR-001 — State ownership

TanStack Query owns CommercePro domain/server-shaped state. Redux Toolkit is reserved for global client-only UI state. Feature-local form/filter state remains local. The current service adapter is temporary until client endpoints arrive.
