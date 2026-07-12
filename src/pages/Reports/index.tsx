import React, { useEffect, useState, useCallback } from 'react';
import { reportsApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { SearchBar } from '../../components/SearchBar';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/Modal';
import { formatDateTime } from '../../utils/format';
import type { AdminReport, ReportListParams } from '../../api/types';

export function ReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [emailSentFilter, setEmailSentFilter] = useState('');

  const [deleteReport, setDeleteReport] = useState<AdminReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ReportListParams = { page, page_size: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (emailSentFilter !== '') params.email_sent = emailSentFilter === 'true';
      const res = await reportsApi.list(params);
      setReports(res.results);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setHasNext(res.has_next);
      setHasPrevious(res.has_previous);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, emailSentFilter]);

  useEffect(() => {
    const t = setTimeout(fetchReports, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchReports]);

  const handleDelete = async () => {
    if (!deleteReport) return;
    setIsDeleting(true);
    try {
      await reportsApi.delete(deleteReport.id);
      setDeleteReport(null);
      fetchReports();
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'draft' | 'completed' | 'sent'> = {
      draft: 'draft', completed: 'completed', sent: 'sent',
    };
    return map[status?.toLowerCase()] ?? 'default';
  };

  const columns: Column<AdminReport>[] = [
    {
      key: 'report_number',
      header: 'Report #',
      render: (r) => <span className="report-number">{r.report_number}</span>,
      width: '120px',
    },
    {
      key: 'inspector_email',
      header: 'Inspector',
      render: (r) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{r.inspector_email?.[0]?.toUpperCase()}</div>
          <span className="user-cell__email">{r.inspector_email}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge label={r.status} variant={getStatusVariant(r.status) as any} />,
      width: '110px',
    },
    {
      key: 'email_sent',
      header: 'Email Sent',
      render: (r) => (
        <span className={`email-sent-icon ${r.email_sent ? 'email-sent-icon--yes' : 'email-sent-icon--no'}`}>
          {r.email_sent ? '✅' : '—'}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'app_version',
      header: 'App Version',
      render: (r) => r.app_version || <span className="text-muted">—</span>,
      width: '110px',
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (r) => formatDateTime(r.created_at),
      width: '160px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button className="action-btn action-btn--delete" onClick={() => setDeleteReport(r)} title="Delete Report">
          🗑️
        </button>
      ),
      width: '80px',
    },
  ];

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by email or report #..." />
          <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="sent">Sent</option>
          </select>
          <select className="filter-select" value={emailSentFilter} onChange={(e) => { setEmailSentFilter(e.target.value); setPage(1); }}>
            <option value="">Email: Any</option>
            <option value="true">Email Sent</option>
            <option value="false">Not Sent</option>
          </select>
        </div>
        <div className="page-toolbar__count">{total} report{total !== 1 ? 's' : ''}</div>
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={reports}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No reports found"
        />
        {!isLoading && total > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            total={total}
            pageSize={20}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteReport}
        onClose={() => setDeleteReport(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        message={`Delete report "${deleteReport?.report_number}"? This cannot be undone.`}
        confirmText="Delete Report"
        isLoading={isDeleting}
      />
    </div>
  );
}
