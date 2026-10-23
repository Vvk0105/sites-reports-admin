import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../api/payment';
import type { PaymentVerificationResponse } from '../../api/types';
import { PageLoader } from '../../components/LoadingSpinner';

// The Stripe webhook usually lands within seconds of the redirect; poll briefly for it.
const POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [payment, setPayment] = useState<PaymentVerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const check = async (attempt: number) => {
      try {
        const result = await paymentApi.verifySession(sessionId);
        if (cancelled) return;
        setPayment(result);
        if (result.paid || attempt >= POLL_ATTEMPTS) {
          setIsLoading(false);
        } else {
          setTimeout(() => check(attempt + 1), POLL_INTERVAL_MS);
        }
      } catch {
        if (cancelled) return;
        setError('Failed to verify payment session. It may be invalid or already processed.');
        setIsLoading(false);
      }
    };

    check(1);

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

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
            <button className="btn btn-primary" onClick={() => window.close()} style={{ width: '100%' }}>
              Close Window
            </button>
          </>
        ) : payment?.paid ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--green)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Thank you for your subscription. It is now active. You can close this window and return to the
              Site Report app.
            </p>
            <button className="btn btn-primary" onClick={() => window.close()} style={{ width: '100%' }}>
              Close Window
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ marginBottom: '1rem' }}>Processing...</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your payment is still being processed. Your subscription will update in the app shortly.
            </p>
            <button className="btn btn-primary" onClick={() => window.close()} style={{ width: '100%' }}>
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
