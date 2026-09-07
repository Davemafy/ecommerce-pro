const seed = {
  products: [
    { id:'KB-PRO-W-01', name:'Pro Wireless Keyboard', sku:'KB-PRO-W-01', category:'Electronics', price:149, stock:42, status:'Active', description:'Premium wireless keyboard built for focused, multi-device work.' },
    { id:'LS-ALU-02', name:'Ergo Laptop Stand', sku:'LS-ALU-02', category:'Accessories', price:59, stock:3, status:'Active', description:'Adjustable aluminium stand for comfortable desk setups.' },
    { id:'HUB-C-V2-00', name:'USB-C Hub v2', sku:'HUB-C-V2-00', category:'Electronics', price:0, stock:0, status:'Draft', description:'Multi-port USB-C hub for modern workstations.' },
    { id:'MON-4K-27', name:'27” 4K Monitor', sku:'MON-4K-27', category:'Electronics', price:399.99, stock:24, status:'Active', description:'27-inch 4K display with sharp colour and flexible connectivity.' },
  ],
  customers: [
    { id:'customer-1', name:'Eleanor Richards', email:'eleanor.r@example.com', phone:'+1 415 555 0182', status:'VIP', address:'1234 Silicon Valley Blvd, San Francisco, CA 94107' },
    { id:'customer-2', name:'Marcus Lee', email:'marcus@example.com', phone:'+1 415 555 0194', status:'Active', address:'88 Market Street, San Francisco, CA 94105' },
    { id:'customer-3', name:'Ava Johnson', email:'ava@example.com', phone:'+1 415 555 0121', status:'Active', address:'310 Mission Street, San Francisco, CA 94105' },
  ],
  orders: [
    { id:'ORD-1008', customerId:'customer-1', customer:'Eleanor Richards', date:'2026-09-05', total:249.99, status:'Completed', sku:'KB-PRO-W-01', quantity:1 },
    { id:'ORD-1007', customerId:'customer-2', customer:'Marcus Lee', date:'2026-09-04', total:129.99, status:'Processing', sku:'LS-ALU-02', quantity:2 },
    { id:'ORD-1006', customerId:'customer-3', customer:'Ava Johnson', date:'2026-09-03', total:399.99, status:'Pending', sku:'MON-4K-27', quantity:1 },
  ],
  settings: { general:{storeName:'CommercePro Official',currency:'USD'}, team:{inviteEmail:'',defaultRole:'Staff'}, payments:{payoutSchedule:'Weekly',invoiceEmail:'billing@commercepro.com'}, notifications:{orders:true,inventory:true,reports:false}, security:{twoFactor:true,sessionAlerts:true} },
};
let runtimeData = structuredClone(seed);
const wait = () => new Promise((resolve) => setTimeout(resolve, 120));
export const commerceService = {
  referenceData: structuredClone(seed),
  async getData() { await wait(); return structuredClone(runtimeData); },
  async replaceData(next: any) { await wait(); runtimeData = structuredClone(next); return structuredClone(runtimeData); },
};
