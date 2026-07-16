import React, { useEffect, useState, useCallback } from 'react';
import { usersApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { SearchBar } from '../../components/SearchBar';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/Modal';
import { CreateUserModal, EditUserModal } from './UserModal';
import { SubscriptionModal } from './SubscriptionModal';
import { formatDate } from '../../utils/format';
import type { AdminUser, UserListParams } from '../../api/types';
import { PageLoader } from '../../components/LoadingSpinner';

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [subUser, setSubUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: UserListParams = { page, page_size: 20 };
      if (search) params.search = search;
      if (planFilter) params.plan = planFilter;
      if (statusFilter !== '') params.status = statusFilter === 'active';
      const res = await usersApi.list(params);
      setUsers(res.results);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setHasNext(res.has_next);
      setHasPrevious(res.has_previous);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      await usersApi.delete(deleteUser.id);
      setDeleteUser(null);
      fetchUsers();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handlePlanChange = (v: string) => { setPlanFilter(v); setPage(1); };
  const handleStatusChange = (v: string) => { setStatusFilter(v); setPage(1); };

  const columns: Column<AdminUser>[] = [
    {
      key: 'email',
      header: 'User',
      render: (u) => (
        <div className="user-cell">
          <div className="user-cell__avatar">{(u.full_name || u.email)?.[0]?.toUpperCase()}</div>
          <div>
            <p className="user-cell__name">{u.full_name || <em className="text-muted">No name</em>}</p>
            <p className="user-cell__email">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan_type',
      header: 'Plan',
      render: (u) => <Badge label={u.plan_type} variant={u.plan_type.toLowerCase().includes('trial') ? 'free' : 'pro'} />,
      width: '130px',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (u) => <Badge label={u.is_active ? 'Active' : 'Inactive'} variant={u.is_active ? 'active' : 'deactivated'} />,
      width: '100px',
    },
    {
      key: 'reports_used',
      header: 'Reports',
      render: (u) => <span className="text-center">{u.reports_used}</span>,
      width: '90px',
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (u) => formatDate(u.created_at),
      width: '120px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="action-btns">
          <button className="action-btn action-btn--edit" onClick={() => setEditUser(u)} title="Edit User">✏️</button>
          <button className="action-btn action-btn--sub" onClick={() => setSubUser(u)} title="Manage Subscription">💳</button>
          <button className="action-btn action-btn--delete" onClick={() => setDeleteUser(u)} title="Delete User">🗑️</button>
        </div>
      ),
      width: '130px',
    },
  ];

  return (
    <div className="page">
      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Search by email or name..." />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by plan name..."
            value={planFilter}
            onChange={(e) => handlePlanChange(e.target.value)}
            style={{ width: '180px' }}
          />
          <select className="filter-select" value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          id="add-user-btn"
          className="btn btn--primary"
          onClick={() => setShowCreate(true)}
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="table-card">
        <DataTable
          columns={columns}
          data={users}
          rowKey={(u) => u.id}
          isLoading={isLoading}
          emptyMessage="No users found"
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

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchUsers}
      />
      <EditUserModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSuccess={fetchUsers}
        user={editUser}
      />
      <SubscriptionModal
        isOpen={!!subUser}
        onClose={() => setSubUser(null)}
        onSuccess={fetchUsers}
        user={subUser}
      />
      <ConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteUser?.email}"? This action cannot be undone.`}
        confirmText="Delete User"
        isLoading={isDeleting}
      />
    </div>
  );
}
