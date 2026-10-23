import client from './client';
import type { PaymentVerificationResponse } from './types';

export const paymentApi = {
  // Public endpoint: the post-checkout page runs without a login. It returns only the paid status.
  verifySession: async (session_id: string): Promise<PaymentVerificationResponse> => {
    const res = await client.get(`/payments/${encodeURIComponent(session_id)}`);
    return res.data;
  },
};
