import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/admin';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/StatCard';
import { PageLoader } from '../../components/LoadingSpinner';
import type { DashboardStats } from '../../api/types';
import { RevenueChart } from './RevenueChart';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoader />;

  if (error) return (
    <div className="page-error">
      <span>⚠️</span>
      <p>{error}</p>
    </div>
  );

  const s = stats!;

  const trialPct = s.total_users > 0 ? Math.round((s.trial_users / s.total_users) * 100) : 0;
  const activePct = s.total_users > 0 ? Math.round((s.active_users / s.total_users) * 100) : 0;
  const paidPct = s.total_users > 0 ? Math.round((s.paid_users / s.total_users) * 100) : 0;

  return (
    <div className="page">
      {/* Stats Grid */}
      <section className="dashboard-stats">
        <StatCard icon="👥" label="Total Users" value={s.total_users} accent="primary" />
        <StatCard icon="✅" label="Active Users" value={s.active_users} accent="teal" sub={`${activePct}% of total`} />
        <StatCard icon="🆓" label="Trial Users" value={s.trial_users} accent="orange" sub={`${trialPct}% of total`} />
        <StatCard icon="💳" label="Paid Users" value={s.paid_users} accent="green" sub={`${paidPct}% of total`} />
        <StatCard icon="📄" label="Total Reports" value={s.total_reports} accent="primary" />
        <StatCard icon="📅" label="Reports Today" value={s.reports_today} accent="teal" />
        <StatCard icon="📆" label="Reports This Month" value={s.reports_this_month} accent="orange" />
      </section>

      {/* Revenue Chart */}
      <section className="dashboard-row" style={{ marginBottom: '1.5rem' }}>
        <RevenueChart />
      </section>

      {/* Breakdown Row */}
      <section className="dashboard-row">
        {/* User Breakdown */}
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">User Breakdown</h3>
          <div className="breakdown-list">
            {[
              { label: 'Trial Users',  value: s.trial_users,  total: s.total_users, color: 'var(--accent-color)' },
              { label: 'Active (Paid)', value: s.paid_users,  total: s.total_users, color: 'var(--secondary-color)' },
              { label: 'All Active',   value: s.active_users, total: s.total_users, color: 'var(--primary-color)' },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div className="breakdown-item" key={item.label}>
                  <div className="breakdown-item__header">
                    <span className="breakdown-item__label">{item.label}</span>
                    <span className="breakdown-item__count">{item.value} <span className="breakdown-item__pct">({pct}%)</span></span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Activity */}
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Report Activity</h3>
          <div className="report-activity">
            {[
              { label: 'Today',      value: s.reports_today,        icon: '🟢', color: 'var(--secondary-color)' },
              { label: 'This Month', value: s.reports_this_month,   icon: '🔵', color: 'var(--primary-color)' },
              { label: 'All Time',   value: s.total_reports,        icon: '⚫', color: 'var(--muted-teal)' },
            ].map((item) => (
              <div className="report-activity__item" key={item.label}>
                <span className="report-activity__icon">{item.icon}</span>
                <div className="report-activity__body">
                  <p className="report-activity__label">{item.label}</p>
                  <p className="report-activity__value" style={{ color: item.color }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3 className="dashboard-card__title">Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/users" className="quick-action-btn">
              <span>➕</span>
              <span>Add New User</span>
            </Link>
            <Link to="/subscriptions" className="quick-action-btn">
              <span>💳</span>
              <span>Manage Subscriptions</span>
            </Link>
            <Link to="/login-logs" className="quick-action-btn">
              <span>🔐</span>
              <span>View Login Activity</span>
            </Link>
            <Link to="/reports" className="quick-action-btn">
              <span>📄</span>
              <span>Browse Reports</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
