import React from 'react';

export function PaymentCancelPage() {

  return (
    <div className="login-layout">
      <div className="login-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>Payment Cancelled</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          You have cancelled the checkout process. No charges have been made.
        </p>
        
        <button className="btn btn-primary" onClick={() => window.close()} style={{ width: '100%', marginBottom: '1rem' }}>
          Close Window
        </button>
      </div>
    </div>
  );
}
