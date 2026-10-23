import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoadingSpinner, PageLoader } from '../components/LoadingSpinner';

// Pages load on demand so the login screen does not download the whole admin.
const LoginPage = lazy(() => import('../pages/Login').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import('../pages/Users').then((m) => ({ default: m.UsersPage })));
const SubscriptionsPage = lazy(() => import('../pages/Subscriptions').then((m) => ({ default: m.SubscriptionsPage })));
const PlansPage = lazy(() => import('../pages/Plans').then((m) => ({ default: m.PlansPage })));
const PaymentsPage = lazy(() => import('../pages/Payments').then((m) => ({ default: m.PaymentsPage })));
const ReportsPage = lazy(() => import('../pages/Reports').then((m) => ({ default: m.ReportsPage })));
const LoginLogsPage = lazy(() => import('../pages/LoginLogs').then((m) => ({ default: m.LoginLogsPage })));
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccess').then((m) => ({ default: m.PaymentSuccessPage })));
const PaymentCancelPage = lazy(() => import('../pages/PaymentCancel').then((m) => ({ default: m.PaymentCancelPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner size="md" />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancel" element={<PaymentCancelPage />} />

        {/* Protected admin routes */}
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="login-logs" element={<LoginLogsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
