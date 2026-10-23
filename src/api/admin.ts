import client from './client';
import type {
  AdminReport,
  AdminReportListResponse,
  AdminSubscription,
  AdminSubscriptionListResponse,
  AdminUser,
  AdminUserDetail,
  AdminUserListResponse,
  CreatePlanRequest,
  CreateUserRequest,
  DashboardStats,
  ListParams,
  LoginLogListResponse,
  PaymentListResponse,
  Plan,
  ReportListParams,
  SubscriptionListParams,
  RevenueChartResponse,
  RevenueInterval,
  UpdatePlanRequest,
  UpdateSubscriptionRequest,
  UpdateUserRequest,
  UserListParams,
} from './types';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const res = await client.get('/admin/dashboard');
    return res.data;
  },

  revenue: async (
    interval: RevenueInterval,
    start_date: string,
    end_date: string,
  ): Promise<RevenueChartResponse> => {
    const res = await client.get('/admin/dashboard/revenue', {
      params: { interval, start_date, end_date },
    });
    return res.data;
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersApi = {
  list: async (params: UserListParams = {}): Promise<AdminUserListResponse> => {
    const res = await client.get('/admin/users', { params });
    return res.data;
  },

  get: async (id: number): Promise<AdminUserDetail> => {
    const res = await client.get(`/admin/users/${id}`);
    return res.data;
  },

  create: async (data: CreateUserRequest): Promise<AdminUser> => {
    const res = await client.post('/admin/users', data);
    return res.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<AdminUserDetail> => {
    const res = await client.put(`/admin/users/${id}`, data);
    return res.data;
  },

  delete: async (id: number, hardDelete = false): Promise<void> => {
    await client.delete(`/admin/users/${id}`, { params: { hard: hardDelete } });
  },

  updateSubscription: async (userId: number, data: UpdateSubscriptionRequest): Promise<AdminSubscription> => {
    const res = await client.put(`/admin/users/${userId}/subscription`, data);
    return res.data;
  },
};

// ─── Subscriptions ───────────────────────────────────────────────────────────

export const subscriptionsApi = {
  list: async (params: SubscriptionListParams = {}): Promise<AdminSubscriptionListResponse> => {
    const res = await client.get('/admin/subscriptions', { params });
    return res.data;
  },
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  list: async (params: ReportListParams = {}): Promise<AdminReportListResponse> => {
    const res = await client.get('/admin/reports', { params });
    return res.data;
  },

  get: async (id: number): Promise<AdminReport> => {
    const res = await client.get(`/admin/reports/${id}`);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/admin/reports/${id}`);
  },
};

// ─── Login Logs ──────────────────────────────────────────────────────────────

export const loginLogsApi = {
  list: async (params: ListParams = {}): Promise<LoginLogListResponse> => {
    const res = await client.get('/admin/login-logs', { params });
    return res.data;
  },
};

// ─── Plans ───────────────────────────────────────────────────────────────────

export const plansApi = {
  list: async (): Promise<Plan[]> => {
    const res = await client.get('/admin/plans');
    return res.data;
  },

  create: async (data: CreatePlanRequest): Promise<Plan> => {
    const res = await client.post('/admin/plans', data);
    return res.data;
  },

  update: async (id: number, data: UpdatePlanRequest): Promise<Plan> => {
    const res = await client.put(`/admin/plans/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await client.delete(`/admin/plans/${id}`);
  },
};

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  list: async (params: ListParams = {}): Promise<PaymentListResponse> => {
    const res = await client.get('/admin/payments', { params });
    return res.data;
  },
};
