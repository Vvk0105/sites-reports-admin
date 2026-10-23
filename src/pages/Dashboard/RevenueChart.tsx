import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../../api/admin';
import type { RevenueChartData, RevenueInterval } from '../../api/types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/format';

const RANGE_START_DAYS: Record<string, number | 'all'> = {
  '7d': 7,
  '30d': 30,
  '1y': 365,
  all: 'all',
};

function rangeStart(range: string): Date {
  const start = new Date();
  const days = RANGE_START_DAYS[range];
  if (days === 'all') return new Date('2020-01-01');
  start.setDate(start.getDate() - days);
  return start;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueChartData[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currency, setCurrency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [interval, setInterval] = useState<RevenueInterval>('daily');
  const [range, setRange] = useState('30d');

  useEffect(() => {
    // Ignore responses from requests that were superseded by a newer filter change.
    let cancelled = false;
    const end = new Date();

    setIsLoading(true);
    setError('');

    dashboardApi
      .revenue(interval, rangeStart(range).toISOString(), end.toISOString())
      .then((res) => {
        if (cancelled) return;
        setCurrencies(res.currencies);
        setData(res.data);
        setCurrency((current) => (res.currencies.includes(current) ? current : res.currencies[0] ?? ''));
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load revenue data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [interval, range]);

  const series = data.filter((point) => point.currency === currency);

  return (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div
        className="dashboard-card__header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
      >
        <h3 className="dashboard-card__title" style={{ margin: 0, border: 'none', padding: 0 }}>
          Revenue Over Time
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            className="form-select"
            style={{ width: '130px', padding: '0.4rem 2rem 0.4rem 0.75rem' }}
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Date range"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <select
            className="form-select"
            style={{ width: '120px', padding: '0.4rem 2rem 0.4rem 0.75rem' }}
            value={interval}
            onChange={(e) => setInterval(e.target.value as RevenueInterval)}
            aria-label="Grouping"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {currencies.length > 1 && (
            <select
              className="form-select"
              style={{ width: '110px', padding: '0.4rem 2rem 0.4rem 0.75rem' }}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div style={{ height: '350px', width: '100%', position: 'relative' }}>
        {isLoading && (
          <div
            style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10,
            }}
          >
            <LoadingSpinner size="md" />
          </div>
        )}

        {error ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
            ⚠️ {error}
          </div>
        ) : series.length === 0 && !isLoading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value, currency).replace(/\.00$/, '')}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                formatter={(value) => [formatCurrency(Number(value ?? 0), currency), 'Revenue']}
                labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, fill: 'var(--teal)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
