import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { usersApi, plansApi } from '../../api/admin';
import type { AdminUser, UpdateSubscriptionRequest, Plan } from '../../api/types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
}

const STATUS_OPTIONS = ['trial', 'active', 'cancelled', 'expired', 'deactivated'];

export function SubscriptionModal({ isOpen, onClose, onSuccess, user }: SubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<number>(0);
  const [status, setStatus] = useState('active');
  const [endDate, setEndDate] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  useEffect(() => {
    setError('');
    setStatus('active');
    // Default end date: 1 year from today
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setEndDate(d.toISOString().split('T')[0]);
  }, [user]);

  const fetchPlans = async () => {
    setIsFetchingPlans(true);
    try {
      const data = await plansApi.list();
      setPlans(data);
      if (data.length > 0 && !planId) {
        setPlanId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setIsFetchingPlans(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const req: UpdateSubscriptionRequest = {
        plan_id: planId,
        status,
        end_date: endDate ? new Date(endDate).toISOString() : null,
      };
      await usersApi.updateSubscription(user.id, req);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update subscription.';
      setError(msg);
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
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isLoading || isFetchingPlans}>
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

      {isFetchingPlans ? (
        <div style={{ padding: '2rem 0' }}>
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sub-plan">Plan</label>
              <select id="sub-plan" className="form-select" value={planId} onChange={(e) => setPlanId(Number(e.target.value))}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currency} {p.price})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sub-status">Status</label>
              <select id="sub-status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
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
