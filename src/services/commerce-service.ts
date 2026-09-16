const PERSISTED_KEY = 'commercepro-safe-preferences-v1';

const seed = {
  products: [
    { id:'KB-PRO-W-01', name:'Pro Wireless Keyboard', sku:'KB-PRO-W-01', category:'Electronics', price:149, stock:42, status:'Active', description:'Premium wireless keyboard built for focused, multi-device work.' },
    { id:'LS-ALU-02', name:'Ergo Laptop Stand', sku:'LS-ALU-02', category:'Accessories', price:59, stock:3, status:'Active', description:'Adjustable aluminium stand for comfortable desk setups.' },
    { id:'HUB-C-V2-00', name:'USB-C Hub v2', sku:'HUB-C-V2-00', category:'Electronics', price:89, stock:0, status:'Draft', description:'Multi-port USB-C hub for modern workstations.' },
    { id:'MON-4K-27', name:'27” 4K Monitor', sku:'MON-4K-27', category:'Electronics', price:399.99, stock:24, status:'Active', description:'27-inch 4K display with sharp colour and flexible connectivity.' },
  ],
  customers: [
    { id:'customer-1', name:'Eleanor Richards', email:'eleanor.r@example.com', phone:'+1 415 555 0182', status:'VIP', address:'1234 Silicon Valley Blvd, San Francisco, CA 94107' },
    { id:'customer-2', name:'Marcus Lee', email:'marcus@example.com', phone:'+1 415 555 0194', status:'Active', address:'88 Market Street, San Francisco, CA 94105' },
    { id:'customer-3', name:'Ava Johnson', email:'ava@example.com', phone:'+1 415 555 0121', status:'Active', address:'310 Mission Street, San Francisco, CA 94105' },
  ],
  orders: [
    { id:'ORD-1008', customerId:'customer-1', customer:'Eleanor Richards', date:'2026-09-05', total:149, status:'Completed', sku:'KB-PRO-W-01', quantity:1 },
    { id:'ORD-1007', customerId:'customer-2', customer:'Marcus Lee', date:'2026-09-04', total:118, status:'Processing', sku:'LS-ALU-02', quantity:2 },
    { id:'ORD-1006', customerId:'customer-3', customer:'Ava Johnson', date:'2026-09-03', total:399.99, status:'Pending', sku:'MON-4K-27', quantity:1 },
    { id:'ORD-1005', customerId:'customer-1', customer:'Eleanor Richards', date:'2026-09-02', total:298, status:'Completed', sku:'KB-PRO-W-01', quantity:2 },
    { id:'ORD-1004', customerId:'customer-2', customer:'Marcus Lee', date:'2026-09-01', total:399.99, status:'Completed', sku:'MON-4K-27', quantity:1 },
    { id:'ORD-1003', customerId:'customer-3', customer:'Ava Johnson', date:'2026-08-31', total:59, status:'Completed', sku:'LS-ALU-02', quantity:1 },
    { id:'ORD-1002', customerId:'customer-1', customer:'Eleanor Richards', date:'2026-08-29', total:149, status:'Completed', sku:'KB-PRO-W-01', quantity:1 },
    { id:'ORD-1001', customerId:'customer-2', customer:'Marcus Lee', date:'2026-08-27', total:59, status:'Completed', sku:'LS-ALU-02', quantity:1 },
  ],
  settings: { general:{storeName:'CommercePro Official',currency:'USD',timezone:'West Africa Time (WAT) - UTC+1',logoName:'',logoData:''}, team:{inviteEmail:'',defaultRole:'Staff'}, payments:{payoutSchedule:'Weekly',invoiceEmail:'billing@commercepro.com'}, notifications:{orders:true,inventory:true,reports:false}, security:{twoFactor:true,sessionAlerts:true} },
};

let runtimeData = structuredClone(seed);
const wait = () => new Promise((resolve) => setTimeout(resolve, 120));

function readSafePreferences() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PERSISTED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSafePreferences(next: any) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PERSISTED_KEY, JSON.stringify({
      products: next.products,
      settings: next.settings,
    }));
  } catch {
    // The preview still works when storage is unavailable.
  }
}

export const commerceService = {
  referenceData: structuredClone(seed),
  async getData() {
    await wait();
    const persisted = readSafePreferences();
    if (persisted) {
      runtimeData = {
        ...runtimeData,
        products: Array.isArray(persisted.products) ? persisted.products : runtimeData.products,
        settings: persisted.settings ? { ...runtimeData.settings, ...persisted.settings } : runtimeData.settings,
      };
    }
    return structuredClone(runtimeData);
  },
  async replaceData(next: any) {
    await wait();
    runtimeData = structuredClone(next);
    persistSafePreferences(runtimeData);
    return structuredClone(runtimeData);
  },
  async reset() {
    runtimeData = structuredClone(seed);
    if (typeof window !== 'undefined') window.localStorage.removeItem(PERSISTED_KEY);
    return structuredClone(runtimeData);
  },
};
