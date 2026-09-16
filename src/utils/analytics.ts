export type OrderLike = { date: string; total: number; status?: string };

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0,0,0,0);
  return date;
}

export function buildDailyRevenueSeries(orders: OrderLike[], points = 8) {
  if (!orders.length) return Array.from({length: points}, (_, index) => ({ label: `Day ${index+1}`, value: 0 }));
  const sorted = [...orders].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
  const latest = startOfDay(new Date(sorted[sorted.length-1].date));
  return Array.from({length: points}, (_, index) => {
    const date = new Date(latest);
    date.setDate(latest.getDate() - (points - 1 - index));
    const key = date.toISOString().slice(0,10);
    const value = orders.filter(order=>order.date===key).reduce((sum,order)=>sum+Number(order.total||0),0);
    return { label: date.toLocaleDateString('en-US',{month:'short',day:'numeric'}), value };
  });
}

export function buildPeriodRevenueSeries(orders: OrderLike[], range: string) {
  const count = range === 'Last 7 Days' ? 7 : range === 'Last 30 Days' ? 6 : range === 'Last 90 Days' ? 6 : 6;
  const sorted = [...orders].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
  if (!sorted.length) return Array.from({length:count},(_,index)=>({label:`P${index+1}`,value:0}));
  const latest = startOfDay(new Date(sorted[sorted.length-1].date));
  const windowDays = range === 'Last 7 Days' ? 7 : range === 'Last 30 Days' ? 30 : range === 'Last 90 Days' ? 90 : 365;
  const bucketDays = Math.max(1, Math.ceil(windowDays / count));
  const first = new Date(latest);
  first.setDate(latest.getDate() - windowDays + 1);
  return Array.from({length:count},(_,index)=>{
    const bucketStart = new Date(first);
    bucketStart.setDate(first.getDate() + index * bucketDays);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + bucketDays - 1);
    const value = orders.filter(order=>{
      const date=startOfDay(new Date(order.date));
      return date>=bucketStart && date<=bucketEnd;
    }).reduce((sum,order)=>sum+Number(order.total||0),0);
    return {
      label: windowDays <= 7 ? bucketStart.toLocaleDateString('en-US',{weekday:'short'}) : bucketStart.toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      value,
    };
  });
}

export function totalRevenue(orders: OrderLike[]) {
  return orders.reduce((sum,order)=>sum+Number(order.total||0),0);
}

export function averageOrderValue(orders: OrderLike[]) {
  return totalRevenue(orders) / Math.max(1,orders.length);
}
