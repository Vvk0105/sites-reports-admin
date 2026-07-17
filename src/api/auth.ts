import client from './client';
import type { LoginRequest, LoginResponse, AdminMe } from './types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await client.post('/auth/admin/login', data);
    return res.data;
  },

  me: async (): Promise<AdminMe> => {
    const res = await client.get('/admin/me');
    return res.data;
  },

  refresh: async (refresh_token: string): Promise<LoginResponse> => {
    const res = await client.post('/auth/refresh', { refresh_token });
    return res.data;
  },

  logout: async (refresh_token: string): Promise<void> => {
    await client.post('/auth/logout', { refresh_token });
  },
};
