import React, { useCallback, useEffect, useState } from 'react';
import { subscriptionsApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { SearchBar } from '../../components/SearchBar';
import { SubscriptionModal } from '../Users/SubscriptionModal';
import { formatDate } from '../../utils/format';
import { UNLIMITED_REPORTS } from '../../api/types';
import type { AdminSubscription, AdminUser, SubscriptionStatus } from '../../api/types';

const PAGE_SIZE = 20;

function statusVariant(status: string): 'active' | 'expired' | 'deactivated' {
  if (status === 'cancelled') return 'deactivated';
  if (status === 'expired') return 'expired';
  return 'active';
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');

  const [subTarget, setSubTarget] = useState<AdminUser | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await subscriptionsApi.list({
        page,
        page_size: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setSubscriptions(res.results);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setHasNext(res.has_next);
      setHasPrevious(res.has_previous);
    } catch {
      setError('Could not load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchData, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value: SubscriptionStatus | '') => {
    setStatusFilter(value);
    setPage(1);
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
      render: (s) => (
        <Badge label={s.plan_type} variant={s.plan_type.toLowerCase().includes('trial') ? 'free' : 'pro'} />
      ),
      width: '130px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <Badge label={s.status.charAt(0).toUpperCase() + s.status.slice(1)} variant={statusVariant(s.status)} />
      ),
      width: '110px',
    },
    {
      key: 'report_limit',
      header: 'Report Limit',
      render: (s) => (s.report_limit === UNLIMITED_REPORTS ? '∞ Unlimited' : s.report_limit),
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
      render: (s) => (s.end_date ? formatDate(s.end_date) : <span className="text-muted">No expiry</span>),
      width: '130px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <button
          className="action-btn action-btn--sub"
          onClick={() =>
            setSubTarget({
              id: s.user_id,
              email: s.email,
              full_name: null,
              is_active: true,
              is_admin: false,
              created_at: '',
              plan_type: s.plan_type,
              reports_used: 0,
            })
          }
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
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by email..." />
          <select className="filter-select" value={statusFilter} onChange={(e) => handleStatus(e.target.value as SubscriptionStatus | '')}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="page-toolbar__count">
          {total} subscription{total !== 1 ? 's' : ''}
        </div>
      </div>

      {error && <div className="form-error" role="alert">⚠️ {error}</div>}

      <div className="table-card">
        <DataTable
          columns={columns}
          data={subscriptions}
          rowKey={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="No subscriptions found"
        />
        {!isLoading && total > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      <SubscriptionModal
        isOpen={!!subTarget}
        onClose={() => setSubTarget(null)}
        onSuccess={() => {
          setSubTarget(null);
          fetchData();
        }}
        user={subTarget}
      />
    </div>
  );
}
