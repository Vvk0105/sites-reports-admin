import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':     { title: 'Dashboard',     subtitle: 'Platform overview and key metrics' },
  '/users':         { title: 'User Management', subtitle: 'Manage app users and their access' },
  '/subscriptions': { title: 'Subscriptions',  subtitle: 'View and manage subscription plans' },
  '/reports':       { title: 'Reports',         subtitle: 'All inspection reports across the platform' },
  '/login-logs':    { title: 'Login Activity',  subtitle: 'Track user login history' },
};

export function Header() {
  const { pathname } = useLocation();
  const info = pageTitles[pathname] ?? { title: 'Admin', subtitle: '' };
  const now = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <h1 className="admin-header__title">{info.title}</h1>
        <p className="admin-header__subtitle">{info.subtitle}</p>
      </div>
      <div className="admin-header__right">
        <span className="admin-header__date">{now}</span>
        <div className="admin-header__badge">
          <span className="admin-header__badge-dot" />
          <span>Live</span>
        </div>
      </div>
    </header>
  );
}
