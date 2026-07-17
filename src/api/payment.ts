import client from './client';
import type { PaymentVerificationResponse } from './types';

export const paymentApi = {
  verifySession: async (session_id: string): Promise<PaymentVerificationResponse> => {
    // Note: We use client directly, if it fails due to auth it will trigger the redirect
    // but the backend endpoint has been updated to be public, so we don't need auth.
    const res = await client.get(`/api/v1/payments/${session_id}`);
    return res.data;
  },
};
