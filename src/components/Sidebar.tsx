import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/users',     icon: '👥', label: 'Users' },
  { path: '/plans',     icon: '📋', label: 'Plans' },
  { path: '/subscriptions', icon: '💳', label: 'Subscriptions' },
  { path: '/payments',  icon: '💰', label: 'Payments' },
  { path: '/reports',   icon: '📄', label: 'Reports' },
  { path: '/login-logs', icon: '🔐', label: 'Login Logs' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__brand">
        <div className="sidebar__logo-mark">SR</div>
        {!collapsed && (
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">Sites' Reports</span>
            <span className="sidebar__logo-sub">Admin Panel</span>
          </div>
        )}
        <button
          className="sidebar__collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar__nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {!collapsed && user && (
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {(user.name || user.email)?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user.name || 'Admin'}</p>
              <p className="sidebar__user-email">{user.email}</p>
            </div>
          </div>
        )}
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
