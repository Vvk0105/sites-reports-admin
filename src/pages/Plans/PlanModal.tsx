import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { plansApi } from '../../api/admin';
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '../../api/types';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: Plan | null;
}

export function PlanModal({ isOpen, onClose, onSuccess, plan }: PlanModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState('AUD');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [reportLimit, setReportLimit] = useState(10);
  const [trialDays, setTrialDays] = useState(0);
  const [isTrial, setIsTrial] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description || '');
      setPrice(plan.price);
      setCurrency(plan.currency);
      setBillingCycle(plan.billing_cycle);
      setReportLimit(plan.report_limit);
      setTrialDays(plan.trial_days);
      setIsTrial(plan.is_trial);
      setIsActive(plan.is_active);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setCurrency('AUD');
      setBillingCycle('monthly');
      setReportLimit(10);
      setTrialDays(0);
      setIsTrial(false);
      setIsActive(true);
    }
    setError('');
  }, [plan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (plan) {
        const req: UpdatePlanRequest = {
          name,
          description: description || null,
          price: Number(price),
          currency,
          billing_cycle: billingCycle,
          report_limit: Number(reportLimit),
          trial_days: Number(trialDays),
          is_trial: isTrial,
          is_active: isActive,
        };
        await plansApi.update(plan.id, req);
      } else {
        const req: CreatePlanRequest = {
          name,
          description: description || null,
          price: Number(price),
          currency,
          billing_cycle: billingCycle,
          report_limit: Number(reportLimit),
          trial_days: Number(trialDays),
          is_trial: isTrial,
        };
        await plansApi.create(req);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save plan.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? 'Edit Plan' : 'Create Plan'}
      size="md"
      footer={
        <div className="modal__footer-actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : (plan ? 'Save Changes' : 'Create Plan')}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pro Plan" required />
        </div>
        
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price</label>
            <input type="number" step="0.01" className="form-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="AUD">AUD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Billing Cycle</label>
            <select className="form-select" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Report Limit</label>
            <input type="number" className="form-input" value={reportLimit} onChange={(e) => setReportLimit(Number(e.target.value))} />
            <p className="form-hint">Use 99999 for unlimited</p>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Trial Days</label>
            <input type="number" className="form-input" value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} />
          </div>
        </div>

        <div className="form-toggles">
          <label className="toggle-label">
            Is Trial Plan
            <button
              type="button"
              className={`toggle ${isTrial ? 'toggle--on' : ''}`}
              onClick={() => setIsTrial(!isTrial)}
            >
              <span className="toggle__knob" />
            </button>
          </label>
          
          {plan && (
            <label className="toggle-label">
              Is Active
              <button
                type="button"
                className={`toggle ${isActive ? 'toggle--on' : ''}`}
                onClick={() => setIsActive(!isActive)}
              >
                <span className="toggle__knob" />
              </button>
            </label>
          )}
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
      </form>
    </Modal>
  );
}
