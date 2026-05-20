import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">F</span>
          <span className="brand-text">Finova</span>
        </div>

        <div className="nav-links">
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/transactions" className="nav-link">Transactions</NavLink>
          <NavLink to="/transfer" className="nav-link">Transfer</NavLink>
          <NavLink to="/deposit" className="nav-link">Deposit</NavLink>
          <NavLink to="/credit-cards" className="nav-link">Cards</NavLink>
          <NavLink to="/loan" className="nav-link">Loan</NavLink>
          <NavLink to="/notifications" className="nav-link">Notifications</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin" className="nav-link">Admin</NavLink>}
        </div>

        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
