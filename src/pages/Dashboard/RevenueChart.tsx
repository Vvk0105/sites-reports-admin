import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { dashboardApi } from '../../api/admin';
import type { RevenueChartData } from '../../api/types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function RevenueChart() {
  const [data, setData] = useState<RevenueChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [interval, setInterval] = useState('daily');
  const [range, setRange] = useState('30d');

  const dummyRevenueData: RevenueChartData[] = [
    { date: '2026-06-18', revenue: 120 },
    { date: '2026-06-19', revenue: 180 },
    { date: '2026-06-20', revenue: 150 },
    { date: '2026-06-21', revenue: 240 },
    { date: '2026-06-22', revenue: 320 },
    { date: '2026-06-23', revenue: 280 },
    { date: '2026-06-24', revenue: 390 },
    { date: '2026-06-25', revenue: 420 },
    { date: '2026-06-26', revenue: 380 },
    { date: '2026-06-27', revenue: 470 },
    { date: '2026-06-28', revenue: 510 },
    { date: '2026-06-29', revenue: 620 },
    { date: '2026-06-30', revenue: 590 },
    { date: '2026-07-01', revenue: 680 },
    { date: '2026-07-02', revenue: 720 },
    { date: '2026-07-03', revenue: 810 },
    { date: '2026-07-04', revenue: 780 },
    { date: '2026-07-05', revenue: 900 },
    { date: '2026-07-06', revenue: 860 },
    { date: '2026-07-07', revenue: 980 },
    { date: '2026-07-08', revenue: 1050 },
    { date: '2026-07-09', revenue: 1100 },
    { date: '2026-07-10', revenue: 1080 },
    { date: '2026-07-11', revenue: 1170 },
    { date: '2026-07-12', revenue: 1240 },
    { date: '2026-07-13', revenue: 1310 },
    { date: '2026-07-14', revenue: 1280 },
    { date: '2026-07-15', revenue: 1380 },
    { date: '2026-07-16', revenue: 1450 },
    { date: '2026-07-17', revenue: 1520 },
  ];

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      setData(dummyRevenueData);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let start = new Date();
    const end = new Date();
    
    if (range === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (range === '30d') {
      start.setDate(end.getDate() - 30);
    } else if (range === '1y') {
      start.setFullYear(end.getFullYear() - 1);
    } else {
      start = new Date('2020-01-01'); // all time
    }
    
    setIsLoading(true);
    setError('');
    
    dashboardApi.revenue(
      interval,
      start.toISOString(),
      end.toISOString()
    )
    .then((res) => {
      setData(res.data);
    })
    .catch(() => setError('Failed to load revenue data'))
    .finally(() => setIsLoading(false));
  }, [interval, range]);

  return (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="dashboard-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 className="dashboard-card__title" style={{ margin: 0, border: 'none', padding: 0 }}>Revenue Over Time</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="form-select" 
            style={{ width: '130px', padding: '0.4rem 2rem 0.4rem 0.75rem' }}
            value={range} 
            onChange={(e) => setRange(e.target.value)}
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
            onChange={(e) => setInterval(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      
      <div style={{ height: '350px', width: '100%', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
            <LoadingSpinner size="md" />
          </div>
        )}
        
        {error ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
            ⚠️ {error}
          </div>
        ) : data.length === 0 && !isLoading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                axisLine={false} 
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
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
