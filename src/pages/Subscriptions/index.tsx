import React, { useEffect, useState, useCallback } from 'react';
import { subscriptionsApi, usersApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { SearchBar } from '../../components/SearchBar';
import { SubscriptionModal } from '../Users/SubscriptionModal';
import { formatDate } from '../../utils/format';
import type { AdminSubscription, AdminUser } from '../../api/types';
import { PageLoader } from '../../components/LoadingSpinner';

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [filtered, setFiltered] = useState<AdminSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // For subscription modal: we need an AdminUser-like object
  const [subTarget, setSubTarget] = useState<AdminUser | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await subscriptionsApi.list();
      setSubscriptions(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter in memory
  useEffect(() => {
    let result = subscriptions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.email.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((s) => s.status === statusFilter);
    if (planFilter) result = result.filter((s) => s.plan_type === planFilter);
    setFiltered(result);
  }, [subscriptions, search, statusFilter, planFilter]);

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'active' | 'trial' | 'expired' | 'deactivated'> = {
      active: 'active', trial: 'trial', expired: 'expired', deactivated: 'deactivated',
    };
    return map[status] ?? 'default';
  };

  const columns: Column<AdminSubscription>[] = [
    {
      key: 'email',
      header: 'User Email',
      render: (s) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{s.email[0]?.toUpperCase()}</div>
          <span className="user-cell__email">{s.email}</span>
        </div>
      ),
    },
    {
      key: 'plan_type',
      header: 'Plan',
      render: (s) => <Badge label={s.plan_type === 'yearly' ? 'Yearly Pro' : 'Free Trial'} variant={s.plan_type === 'yearly' ? 'pro' : 'free'} />,
      width: '130px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <Badge label={s.status.charAt(0).toUpperCase() + s.status.slice(1)} variant={getStatusVariant(s.status) as any} />,
      width: '110px',
    },
    {
      key: 'report_limit',
      header: 'Report Limit',
      render: (s) => s.report_limit >= 99999 ? '∞ Unlimited' : s.report_limit,
      width: '120px',
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (s) => formatDate(s.start_date),
      width: '120px',
    },
    {
      key: 'end_date',
      header: 'Expiry Date',
      render: (s) => s.end_date ? formatDate(s.end_date) : <span className="text-muted">No expiry</span>,
      width: '130px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <button
          className="action-btn action-btn--sub"
          onClick={() => setSubTarget({ id: s.user_id, email: s.email, full_name: null, is_active: true, is_admin: false, created_at: '', plan_type: s.plan_type, reports_used: 0 })}
          title="Manage Subscription"
        >
          ✏️ Edit
        </button>
      ),
      width: '100px',
    },
  ];

  return (
    <div className="page">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by email..." />
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <select className="filter-select" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="">All Plans</option>
            <option value="trial">Free Trial</option>
            <option value="yearly">Yearly Pro</option>
          </select>
        </div>
        <div className="page-toolbar__count">
          {filtered.length} subscription{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="No subscriptions found"
        />
      </div>

      {/* Edit Subscription Modal */}
      <SubscriptionModal
        isOpen={!!subTarget}
        onClose={() => setSubTarget(null)}
        onSuccess={() => { setSubTarget(null); fetchData(); }}
        user={subTarget}
      />
    </div>
  );
}
