export type OrderLike = { date: string; total: number; status?: string };

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function orderDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function rangeBounds(range: string, anchorDate = new Date()) {
  const end = endOfDay(anchorDate);
  const start = startOfDay(anchorDate);

  if (range === 'This Year') {
    start.setMonth(0, 1);
    return { start, end };
  }

  const days = range === 'Last 7 Days' ? 7 : range === 'Last 90 Days' ? 90 : 30;
  start.setDate(start.getDate() - days + 1);
  return { start, end };
}

export function filterOrdersByRange(orders: OrderLike[], range: string, anchorDate = new Date()) {
  const { start, end } = rangeBounds(range, anchorDate);
  return orders.filter((order) => {
    const date = orderDate(order.date);
    return date !== null && date >= start && date <= end;
  });
}

export function buildDailyRevenueSeries(orders: OrderLike[], points = 8, anchorDate = new Date()) {
  const latest = startOfDay(anchorDate);
  return Array.from({ length: points }, (_, index) => {
    const date = new Date(latest);
    date.setDate(latest.getDate() - (points - 1 - index));
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    const value = orders.reduce((sum, order) => {
      const parsed = orderDate(order.date);
      return parsed && parsed >= date && parsed < next ? sum + Number(order.total || 0) : sum;
    }, 0);
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
    };
  });
}

export function buildPeriodRevenueSeries(orders: OrderLike[], range: string, anchorDate = new Date()) {
  const { start, end } = rangeBounds(range, anchorDate);
  const count = range === 'Last 7 Days' ? 7 : 6;
  const windowMs = Math.max(1, end.getTime() - start.getTime() + 1);
  const bucketMs = Math.ceil(windowMs / count);

  return Array.from({ length: count }, (_, index) => {
    const bucketStart = new Date(start.getTime() + index * bucketMs);
    const bucketEnd = index === count - 1
      ? end
      : new Date(Math.min(end.getTime(), bucketStart.getTime() + bucketMs - 1));

    const value = orders.reduce((sum, order) => {
      const date = orderDate(order.date);
      return date && date >= bucketStart && date <= bucketEnd ? sum + Number(order.total || 0) : sum;
    }, 0);

    return {
      label: range === 'Last 7 Days'
        ? bucketStart.toLocaleDateString('en-US', { weekday: 'short' })
        : bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
    };
  });
}

export function totalRevenue(orders: OrderLike[]) {
  return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
}

export function averageOrderValue(orders: OrderLike[]) {
  return orders.length ? totalRevenue(orders) / orders.length : 0;
}
