import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { plansApi, usersApi } from '../../api/admin';
import type { AdminUser, Plan, SubscriptionStatus, UpdateSubscriptionRequest } from '../../api/types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
}

// Must match the backend SubscriptionStatus enum.
const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.split('T')[0] : '';
}

export function SubscriptionModal({ isOpen, onClose, onSuccess, user }: SubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Load the user's current subscription and the plan list, then pre-fill the form
  // with the real values so saving without changes does not alter the subscription.
  useEffect(() => {
    if (!isOpen || !user) return;

    let cancelled = false;
    setError('');
    setIsFetching(true);

    Promise.all([plansApi.list(), usersApi.get(user.id)])
      .then(([planList, detail]) => {
        if (cancelled) return;
        setPlans(planList);
        setPlanId(detail.plan_id ?? planList[0]?.id ?? null);
        const known = STATUS_OPTIONS.some((o) => o.value === detail.subscription_status);
        setStatus(known ? (detail.subscription_status as SubscriptionStatus) : 'active');
        setEndDate(toDateInput(detail.subscription_end_date));
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the current subscription.');
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || planId === null) return;

    setIsLoading(true);
    setError('');
    try {
      const req: UpdateSubscriptionRequest = {
        plan_id: planId,
        status,
        end_date: endDate ? new Date(`${endDate}T23:59:59Z`).toISOString() : null,
      };
      await usersApi.updateSubscription(user.id, req);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Failed to update subscription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Subscription"
      size="md"
      footer={
        <div className="modal__footer-actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isLoading || isFetching || planId === null}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Update Subscription'}
          </button>
        </div>
      }
    >
      {user && (
        <div className="sub-modal-user">
          <div className="sub-modal-user__avatar">{(user.full_name || user.email)?.[0]?.toUpperCase()}</div>
          <div>
            <p className="sub-modal-user__name">{user.full_name || '—'}</p>
            <p className="sub-modal-user__email">{user.email}</p>
          </div>
        </div>
      )}

      {isFetching ? (
        <div style={{ padding: '2rem 0' }}>
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sub-plan">Plan</label>
              <select
                id="sub-plan"
                className="form-select"
                value={planId ?? ''}
                onChange={(e) => setPlanId(Number(e.target.value))}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currency} {Number(p.price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sub-status">Status</label>
              <select
                id="sub-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sub-end-date">Expiry Date</label>
              <input
                id="sub-end-date"
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="form-hint">Leave blank for no expiry</p>
            </div>
          </div>

          {error && <div className="form-error">⚠️ {error}</div>}
        </form>
      )}
    </Modal>
  );
}
