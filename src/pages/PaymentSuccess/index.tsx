import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../api/payment';
import type { PaymentVerificationResponse } from '../../api/types';
import { PageLoader } from '../../components/LoadingSpinner';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get('session_id');
  const navigate = useNavigate();

  const [payment, setPayment] = useState<PaymentVerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session_id) {
      setError('No session ID found.');
      setIsLoading(false);
      return;
    }

    paymentApi.verifySession(session_id)
      .then(setPayment)
      .catch((err) => {
        console.error(err);
        setError('Failed to verify payment session. It may be invalid or already processed.');
      })
      .finally(() => setIsLoading(false));
  }, [session_id]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="login-layout">
      <div className="login-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        
        {error ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: 'var(--red)', marginBottom: '1rem' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </>
        ) : payment?.paid ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--green)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Thank you for your subscription.
            </p>
            
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Plan</span>
                <strong style={{ color: 'var(--primary-color)' }}>{payment.plan}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid</span>
                <strong>{payment.amount.toLocaleString(undefined, { style: 'currency', currency: payment.currency })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date</span>
                <strong>{new Date(payment.payment_date).toLocaleDateString()}</strong>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ marginBottom: '1rem' }}>Processing...</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your payment is still being processed. Please check back later.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
