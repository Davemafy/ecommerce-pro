# ADR-002 — Client storage

CommercePro does not persist customer/order PII to localStorage. The temporary adapter is memory-only. When backend endpoints arrive, the service boundary becomes HTTP without changing page contracts.
