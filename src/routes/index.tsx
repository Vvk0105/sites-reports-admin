import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/Login';
import { DashboardPage } from '../pages/Dashboard';
import { UsersPage } from '../pages/Users';
import { SubscriptionsPage } from '../pages/Subscriptions';
import { ReportsPage } from '../pages/Reports';
import { LoginLogsPage } from '../pages/LoginLogs';
import { PageLoader } from '../components/LoadingSpinner';

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
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<PublicRoute><LoginPage /></PublicRoute>}
      />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="login-logs" element={<LoginLogsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
