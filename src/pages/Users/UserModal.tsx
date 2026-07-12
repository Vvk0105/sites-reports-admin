import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { usersApi } from '../../api/admin';
import type { AdminUser, AdminUserDetail, CreateUserRequest, UpdateUserRequest } from '../../api/types';

// ─── Create User Modal ────────────────────────────────────────────────────────

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => { setEmail(''); setFullName(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setIsLoading(true);
    setError('');
    try {
      const req: CreateUserRequest = { email: email.trim(), full_name: fullName.trim() || undefined };
      await usersApi.create(req);
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to create user.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New User"
      size="sm"
      footer={
        <div className="modal__footer-actions">
          <button className="btn btn--ghost" onClick={handleClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Create User'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label className="form-label" htmlFor="create-email">Email *</label>
          <input id="create-email" type="email" className="form-input" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="create-fullname">Full Name</label>
          <input id="create-fullname" type="text" className="form-input" value={fullName}
            onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" />
        </div>
        {error && <div className="form-error">⚠️ {error}</div>}
      </form>
    </Modal>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: AdminUser | AdminUserDetail | null;
}

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [isAdmin, setIsAdmin] = useState(user?.is_admin ?? false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync when user prop changes
  React.useEffect(() => {
    setFullName(user?.full_name ?? '');
    setIsActive(user?.is_active ?? true);
    setIsAdmin(user?.is_admin ?? false);
    setError('');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const req: UpdateUserRequest = {
        full_name: fullName.trim() || undefined,
        is_active: isActive,
        is_admin: isAdmin,
      };
      await usersApi.update(user.id, req);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update user.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      size="sm"
      footer={
        <div className="modal__footer-actions">
          <button className="btn btn--ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input form-input--readonly" value={user?.email ?? ''} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="edit-fullname">Full Name</label>
          <input id="edit-fullname" type="text" className="form-input" value={fullName}
            onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        </div>
        <div className="form-toggles">
          <label className="toggle-label">
            <span>Active Account</span>
            <div className={`toggle ${isActive ? 'toggle--on' : ''}`} onClick={() => setIsActive(!isActive)}>
              <div className="toggle__knob" />
            </div>
          </label>
          <label className="toggle-label">
            <span>Admin Access</span>
            <div className={`toggle ${isAdmin ? 'toggle--on' : ''}`} onClick={() => setIsAdmin(!isAdmin)}>
              <div className="toggle__knob" />
            </div>
          </label>
        </div>
        {error && <div className="form-error">⚠️ {error}</div>}
      </form>
    </Modal>
  );
}
