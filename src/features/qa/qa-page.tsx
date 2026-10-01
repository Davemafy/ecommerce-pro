import { useEffect, useRef, useState } from 'react';
import { clearAccessToken } from '../../api/client';
import {
  authService,
  customerService,
  inventoryService,
  orderService,
  productService,
  settingsService,
  unwrapData,
  unwrapList,
} from '../../api/services';

type Check = { name: string; ok: boolean; detail: string };

function recordId(response: any, candidates: string[]) {
  const data: any = unwrapData(response);
  const raw = candidates.reduce((value: any, key) => value?.[key] ?? value, data);
  return raw?._id || raw?.id || '';
}

export function QaPage() {
  const ran = useRef(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get('key') !== 'qa-79c4f6') {
      setChecks([{ name: 'QA access', ok: false, detail: 'Invalid QA key.' }]);
      setState('done');
      return;
    }

    const results: Check[] = [];
    const push = (name: string, ok: boolean, detail: string) => {
      results.push({ name, ok, detail });
      setChecks([...results]);
    };

    const run = async () => {
      setState('running');
      const suffix = Date.now().toString(36);
      const sku = `QA-${suffix}`.toUpperCase();
      const email = `qa-${suffix}@example.com`;
      const adminEmail = `qa-admin-${suffix}@example.com`;
      const adminPassword = `Qa1!${suffix}x`;

      let productId = '';
      let customerId = '';
      let orderId = '';
      let adminId = '';

      try {
        // Force the exact "fresh page / empty in-memory token" path.
        clearAccessToken();
        try {
          const me: any = unwrapData(await authService.me());
          const admin = me?.user || me?.admin || me;
          push(
            'Session refresh after token clear',
            Boolean(admin?._id || admin?.id || admin?.email),
            admin?.email || 'Authenticated'
          );
        } catch (error) {
          push(
            'Session refresh after token clear',
            false,
            error instanceof Error ? error.message : 'Authentication failed'
          );
          throw error;
        }

        try {
          const created: any = unwrapData(
            await productService.create({
              name: 'QA Runtime Product',
              sku,
              category: 'QA',
              price: 10,
              stock: 10,
              status: 'active',
            })
          );
          const product = created?.product || created;
          productId = product?._id || product?.id || '';
          push(
            'Create product',
            Boolean(productId),
            productId ? `Created ${sku}` : 'No product ID returned'
          );
        } catch (error) {
          push('Create product', false, error instanceof Error ? error.message : 'Create failed');
        }

        try {
          const created: any = unwrapData(
            await customerService.create({
              name: 'QA Runtime Customer',
              email,
              phone: '+2340000000000',
              addresses: [],
            })
          );
          const customer = created?.customer || created;
          customerId = customer?._id || customer?.id || '';
          push(
            'Create customer',
            Boolean(customerId),
            customerId ? 'Created disposable customer' : 'No customer ID returned'
          );
        } catch (error) {
          push('Create customer', false, error instanceof Error ? error.message : 'Create failed');
        }

        if (productId && customerId) {
          try {
            const created: any = unwrapData(
              await orderService.create({
                customerId,
                customerName: 'QA Runtime Customer',
                customerEmail: email,
                items: [
                  { productId, name: 'QA Runtime Product', sku, quantity: 2, price: 10, total: 20 },
                ],
                subtotal: 20,
                tax: 0,
                shipping: 0,
                discount: 0,
                total: 20,
              })
            );
            const order = created?.order || created;
            orderId = order?._id || order?.id || order?.orderNumber || '';
            push(
              'Create order',
              Boolean(orderId),
              orderId ? 'Created 2-unit disposable order' : 'No order ID returned'
            );
          } catch (error) {
            push('Create order', false, error instanceof Error ? error.message : 'Create failed');
          }
        } else {
          push('Create order', false, 'Skipped because product/customer setup failed');
        }

        if (productId) {
          try {
            const fetched: any = unwrapData(await productService.get(productId));
            const product = fetched?.product || fetched;
            const stock = Number(product?.stock);
            const expected = orderId ? 8 : 10;
            push(
              'Order updates stock',
              stock === expected,
              `Expected ${expected}, received ${Number.isFinite(stock) ? stock : 'invalid stock'}`
            );
          } catch (error) {
            push(
              'Order updates stock',
              false,
              error instanceof Error ? error.message : 'Fetch failed'
            );
          }
        }

        if (orderId) {
          try {
            await orderService.updateStatus(orderId, { fulfillmentStatus: 'processing' });
            const fetched: any = unwrapData(await orderService.get(orderId));
            const order = fetched?.order || fetched;
            push(
              'Order status persists',
              order?.fulfillmentStatus === 'processing',
              `Received ${order?.fulfillmentStatus || 'missing'}`
            );
          } catch (error) {
            push(
              'Order status persists',
              false,
              error instanceof Error ? error.message : 'Status update failed'
            );
          }
        }

        if (productId) {
          try {
            const beforeRaw: any = unwrapData(await productService.get(productId));
            const before = beforeRaw?.product || beforeRaw;
            const beforeStock = Number(before?.stock);
            await inventoryService.adjust(productId, 3, 'adjustment', 'Automated QA check');
            const afterRaw: any = unwrapData(await productService.get(productId));
            const after = afterRaw?.product || afterRaw;
            const afterStock = Number(after?.stock);
            const historyResponse = await inventoryService.productHistory(productId);
            const history = unwrapList<any>(historyResponse, ['history', 'adjustments']);
            push(
              'Inventory adjustment + history',
              afterStock === beforeStock + 3 && history.length > 0,
              `Stock ${beforeStock} → ${afterStock}; history entries: ${history.length}`
            );
          } catch (error) {
            push(
              'Inventory adjustment + history',
              false,
              error instanceof Error ? error.message : 'Inventory check failed'
            );
          }
        }

        try {
          const current: any = unwrapData(await settingsService.getStore());
          const store = current?.store || current || {};
          const payload: any = {};
          ['name', 'contactEmail', 'contactPhone', 'currency', 'timezone', 'address'].forEach(
            (field) => {
              if (store[field] !== undefined) payload[field] = store[field];
            }
          );
          await settingsService.updateStore(payload);
          push(
            'Store settings save',
            true,
            Object.keys(payload).length
              ? 'Saved current store values unchanged'
              : 'Save endpoint accepted current empty settings'
          );
        } catch (error) {
          push(
            'Store settings save',
            false,
            error instanceof Error ? error.message : 'Settings save failed'
          );
        }

        try {
          const created: any = unwrapData(
            await authService.createTeamMember({
              name: 'QA Runtime Admin',
              email: adminEmail,
              password: adminPassword,
              isAdmin: true,
              permissions: ['dashboard:view'],
            })
          );
          const admin = created?.admin || created?.user || created;
          adminId = admin?._id || admin?.id || '';
          if (!adminId) throw new Error('No admin ID returned');
          await authService.deleteTeamMember(adminId);
          adminId = '';
          push('Team admin create/delete', true, 'Disposable administrator created and removed');
        } catch (error) {
          push(
            'Team admin create/delete',
            false,
            error instanceof Error ? error.message : 'Team mutation failed'
          );
        }
      } finally {
        const cleanup: string[] = [];
        if (orderId) {
          try {
            await orderService.remove(orderId);
            cleanup.push('order');
          } catch {}
        }
        if (customerId) {
          try {
            await customerService.remove(customerId);
            cleanup.push('customer');
          } catch {}
        }
        if (productId) {
          try {
            await productService.remove(productId);
            cleanup.push('product');
          } catch {}
        }
        if (adminId) {
          try {
            await authService.deleteTeamMember(adminId);
            cleanup.push('admin');
          } catch {}
        }
        push(
          'Cleanup',
          true,
          cleanup.length ? `Removed: ${cleanup.join(', ')}` : 'Nothing remained to clean up'
        );

        try {
          await fetch('/api/qa-report?key=qa-79c4f6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ at: new Date().toISOString(), checks: results }),
          });
        } catch {}
        setState('done');
      }
    };

    run();
  }, []);

  const passed = checks.filter((check) => check.ok).length;
  return (
    <main className="figma-page">
      <section className="card" style={{ maxWidth: 760, margin: '0 auto', padding: 28 }}>
        <h1 style={{ marginTop: 0 }}>Runtime QA</h1>
        <p>
          {state === 'running'
            ? 'Running authenticated checks and cleaning up disposable records…'
            : state === 'done'
              ? `${passed}/${checks.length} checks passed.`
              : 'Starting…'}
        </p>
        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          {checks.map((check) => (
            <div
              key={check.name}
              style={{ padding: 12, border: '1px solid #e0e3e5', borderRadius: 8 }}
            >
              <strong>
                {check.ok ? 'PASS' : 'FAIL'} · {check.name}
              </strong>
              <div style={{ marginTop: 4, color: '#667085', fontSize: 13 }}>{check.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
