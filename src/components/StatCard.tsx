import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  accent?: 'primary' | 'teal' | 'orange' | 'green' | 'red';
  sub?: string;
}

export function StatCard({ icon, label, value, accent = 'primary', sub }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}
