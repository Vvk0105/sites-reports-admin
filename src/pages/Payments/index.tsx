import React, { useCallback, useEffect, useState } from 'react';
import { paymentsApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Payment } from '../../api/types';

const PAGE_SIZE = 20;

function statusVariant(status: string): 'active' | 'draft' | 'expired' | 'default' {
  switch (status.toLowerCase()) {
    case 'paid': return 'active';
    case 'pending': return 'draft';
    case 'failed': return 'expired';
    default: return 'default';
  }
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await paymentsApi.list({ page, page_size: PAGE_SIZE });
      setPayments(res.results);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setHasNext(res.has_next);
      setHasPrevious(res.has_previous);
    } catch {
      setError('Could not load payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns: Column<Payment>[] = [
    {
      key: 'user_email',
      header: 'User',
      render: (p) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{p.user_email.charAt(0).toUpperCase()}</div>
          <span className="user-cell__email">{p.user_email}</span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (p) => <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{p.plan}</span>,
      width: '180px',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => <span style={{ fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</span>,
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge label={p.status} variant={statusVariant(p.status)} />,
      width: '100px',
    },
    {
      key: 'stripe_session_id',
      header: 'Transaction ID',
      render: (p) => (
        <span className="text-muted" style={{ fontSize: '0.8rem' }} title={p.stripe_session_id}>
          {p.stripe_session_id.substring(0, 16)}...
        </span>
      ),
      width: '160px',
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (p) => formatDate(p.created_at),
      width: '140px',
    },
  ];

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Payment History</h2>
        </div>
        <div className="page-toolbar__count">
          {total} payment{total !== 1 ? 's' : ''}
        </div>
      </div>

      {error && <div className="form-error" role="alert">⚠️ {error}</div>}

      <div className="table-card">
        <DataTable
          columns={columns}
          data={payments}
          rowKey={(p) => p.id}
          isLoading={isLoading}
          emptyMessage="No payments found"
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
    </div>
  );
}
