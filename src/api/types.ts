// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AdminMe {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_users: number;
  active_users: number;
  trial_users: number;
  paid_users: number;
  total_reports: number;
  reports_today: number;
  reports_this_month: number;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  plan_type: string;
  reports_used: number;
}

export interface AdminUserDetail extends AdminUser {
  subscription_status: string;
  report_limit: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  results: T[];
}

export type AdminUserListResponse = PaginatedResponse<AdminUser>;

export interface CreateUserRequest {
  email: string;
  full_name?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export interface AdminSubscription {
  id: number;
  user_id: number;
  email: string;
  plan_type: string;
  status: string;
  report_limit: number;
  start_date: string;
  end_date: string | null;
}

export interface UpdateSubscriptionRequest {
  plan_type: string;
  report_limit: number;
  status: string;
  end_date?: string | null;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface AdminReport {
  id: number;
  report_number: string;
  user_id: number;
  inspector_email: string;
  status: string;
  email_sent: boolean;
  device_id: string | null;
  app_version: string | null;
  created_at: string;
  completed_at: string | null;
}

export type AdminReportListResponse = PaginatedResponse<AdminReport>;

// ─── Login Logs ───────────────────────────────────────────────────────────────

export interface LoginLog {
  id: number;
  user_id: number;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  login_at: string;
}

export type LoginLogListResponse = PaginatedResponse<LoginLog>;

// ─── List Query Params ───────────────────────────────────────────────────────

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
}

export interface UserListParams extends ListParams {
  plan?: string;
  status?: boolean;
}

export interface ReportListParams extends ListParams {
  status?: string;
  email_sent?: boolean;
}
