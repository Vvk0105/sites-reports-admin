import React, { useEffect, useState, useCallback } from 'react';
import { plansApi } from '../../api/admin';
import { DataTable, Column } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/Modal';
import { PlanModal } from './PlanModal';
import type { Plan } from '../../api/types';

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await plansApi.list();
      setPlans(res);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async () => {
    if (!deletePlan) return;
    setIsDeleting(true);
    try {
      await plansApi.delete(deletePlan.id);
      setDeletePlan(null);
      fetchPlans();
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Plan>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (p) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.name}</span>
          {p.description && <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{p.description}</p>}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => <span style={{ fontWeight: 600 }}>{p.currency} {p.price}</span>,
      width: '100px',
    },
    {
      key: 'billing_cycle',
      header: 'Billing Cycle',
      render: (p) => <span style={{ textTransform: 'capitalize' }}>{p.billing_cycle}</span>,
      width: '120px',
    },
    {
      key: 'report_limit',
      header: 'Report Limit',
      render: (p) => p.report_limit >= 99999 ? '∞' : p.report_limit,
      width: '110px',
    },
    {
      key: 'is_trial',
      header: 'Trial',
      render: (p) => p.is_trial ? <Badge label={`${p.trial_days} days`} variant="free" /> : <span className="text-muted">—</span>,
      width: '100px',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (p) => <Badge label={p.is_active ? 'Active' : 'Inactive'} variant={p.is_active ? 'active' : 'deactivated'} />,
      width: '90px',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="action-btns">
          <button className="action-btn action-btn--edit" onClick={() => setEditPlan(p)} title="Edit Plan">✏️</button>
          <button className="action-btn action-btn--delete" onClick={() => setDeletePlan(p)} title="Delete Plan">🗑️</button>
        </div>
      ),
      width: '100px',
    },
  ];

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="page-toolbar__filters">
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>Plans Configuration</h2>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          + Add Plan
        </button>
      </div>

      <div className="table-card">
        <DataTable
          columns={columns}
          data={plans}
          rowKey={(p) => p.id}
          isLoading={isLoading}
          emptyMessage="No plans configured"
        />
      </div>

      <PlanModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchPlans}
      />
      <PlanModal
        isOpen={!!editPlan}
        onClose={() => setEditPlan(null)}
        onSuccess={fetchPlans}
        plan={editPlan}
      />
      <ConfirmModal
        isOpen={!!deletePlan}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete the plan "${deletePlan?.name}"? Users subscribed to this plan may be affected.`}
        confirmText="Delete Plan"
        isLoading={isDeleting}
      />
    </div>
  );
}
