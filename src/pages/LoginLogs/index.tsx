import React, { useEffect, useState, useCallback } from 'react';
import { loginLogsApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { SearchBar } from '../../components/SearchBar';
import { formatDateTime, truncate } from '../../utils/format';
import type { LoginLog, ListParams } from '../../api/types';

export function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListParams = { page, page_size: 20 };
      if (search) params.search = search;
      if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
      if (dateTo) params.date_to = new Date(dateTo + 'T23:59:59').toISOString();
      const res = await loginLogsApi.list(params);
      setLogs(res.results);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setHasNext(res.has_next);
      setHasPrevious(res.has_previous);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(fetchLogs, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  const columns: Column<LoginLog>[] = [
    {
      key: 'email',
      header: 'User Email',
      render: (l) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{l.email?.[0]?.toUpperCase()}</div>
          <span className="user-cell__email">{l.email}</span>
        </div>
      ),
    },
    {
      key: 'login_at',
      header: 'Login Time',
      render: (l) => formatDateTime(l.login_at),
      width: '170px',
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (l) => l.ip_address || <span className="text-muted">—</span>,
      width: '140px',
    },
    {
      key: 'user_agent',
      header: 'Device / Browser',
      render: (l) => (
        <span title={l.user_agent ?? ''} className="user-agent">
          {truncate(l.user_agent, 60)}
        </span>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by email..."
          />
          <div className="date-range">
            <label className="date-range__label">From</label>
            <input
              type="date"
              className="form-input date-range__input"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
            <label className="date-range__label">To</label>
            <input
              type="date"
              className="form-input date-range__input"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
            {(dateFrom || dateTo) && (
              <button className="btn btn--ghost btn--sm" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}>
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="page-toolbar__count">{total} log{total !== 1 ? 's' : ''}</div>
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={logs}
          rowKey={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No login activity found"
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
    </div>
  );
}
