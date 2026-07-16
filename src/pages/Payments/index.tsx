import React, { useEffect, useState, useCallback } from 'react';
import { paymentsApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { formatDate } from '../../utils/format';
import type { Payment } from '../../api/types';

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await paymentsApi.list();
      setPayments(res);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'active';
      case 'pending': return 'draft';
      case 'failed': return 'expired';
      default: return 'default';
    }
  };

  const columns: Column<Payment>[] = [
    {
      key: 'user_email',
      header: 'User',
      render: (p) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{p.user_email[0]?.toUpperCase()}</div>
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
      render: (p) => <span style={{ fontWeight: 600 }}>{p.currency} {p.amount.toFixed(2)}</span>,
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <Badge label={p.status} variant={getStatusVariant(p.status) as any} />,
      width: '100px',
    },
    {
      key: 'stripe_session_id',
      header: 'Transaction ID',
      render: (p) => <span className="text-muted" style={{ fontSize: '0.8rem' }} title={p.stripe_session_id}>{p.stripe_session_id.substring(0, 16)}...</span>,
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
        <div className="page-toolbar__count">{payments.length} payment{payments.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={payments}
          rowKey={(p) => p.id}
          isLoading={isLoading}
          emptyMessage="No payments found"
        />
      </div>
    </div>
  );
}
