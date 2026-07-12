import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { usersApi } from '../../api/admin';
import type { AdminUser, UpdateSubscriptionRequest } from '../../api/types';
import { formatDate } from '../../utils/format';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | null;
}

const PLAN_OPTIONS = ['trial', 'yearly'];
const STATUS_OPTIONS = ['trial', 'active', 'expired', 'deactivated'];

export function SubscriptionModal({ isOpen, onClose, onSuccess, user }: SubscriptionModalProps) {
  const [planType, setPlanType] = useState('trial');
  const [status, setStatus] = useState('trial');
  const [reportLimit, setReportLimit] = useState(10);
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError('');
    setPlanType('yearly');
    setStatus('active');
    setReportLimit(99999);
    // Default end date: 1 year from today
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setEndDate(d.toISOString().split('T')[0]);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const req: UpdateSubscriptionRequest = {
        plan_type: planType,
        status,
        report_limit: Number(reportLimit),
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
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isLoading}>
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

      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="sub-plan">Plan Type</label>
            <select id="sub-plan" className="form-select" value={planType} onChange={(e) => setPlanType(e.target.value)}>
              {PLAN_OPTIONS.map((o) => (
                <option key={o} value={o}>{o === 'yearly' ? 'Yearly Pro' : 'Free Trial'}</option>
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
            <label className="form-label" htmlFor="sub-limit">Report Limit</label>
            <input
              id="sub-limit"
              type="number"
              className="form-input"
              value={reportLimit}
              min={0}
              onChange={(e) => setReportLimit(Number(e.target.value))}
            />
            <p className="form-hint">Use 99999 for unlimited</p>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sub-end-date">Expiry Date</label>
            <input
              id="sub-end-date"
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
      </form>
    </Modal>
  );
}
