import React from 'react';
import { useNavigate } from 'react-router-dom';

export function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="login-layout">
      <div className="login-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Payment Cancelled</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          You have cancelled the checkout process. No charges have been made.
        </p>
        
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginBottom: '1rem' }}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
