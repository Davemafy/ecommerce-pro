import { describe, expect, it } from 'vitest';
import { buildPeriodRevenueSeries, filterOrdersByRange } from '../utils/analytics';

const anchor = new Date('2026-10-01T12:00:00');

describe('analytics date ranges', () => {
  const orders = [
    { date: '2026-10-01T09:00:00', total: 100 },
    { date: '2026-09-25T09:00:00', total: 50 },
    { date: '2026-09-24T09:00:00', total: 25 },
    { date: '2026-01-02T09:00:00', total: 10 },
    { date: '2025-12-31T09:00:00', total: 5 },
  ];

  it('anchors Last 7 Days to the current date', () => {
    expect(filterOrdersByRange(orders, 'Last 7 Days', anchor).map((order) => order.total)).toEqual([
      100, 50,
    ]);
  });

  it('keeps This Year inside the current calendar year', () => {
    expect(filterOrdersByRange(orders, 'This Year', anchor).map((order) => order.total)).toEqual([
      100, 50, 25, 10,
    ]);
  });

  it('counts timestamped orders in the revenue series', () => {
    const series = buildPeriodRevenueSeries(orders, 'Last 7 Days', anchor);
    expect(series.reduce((sum, point) => sum + point.value, 0)).toBe(150);
  });
});
