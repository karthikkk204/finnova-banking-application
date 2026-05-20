import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loanFilter, setLoanFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, loansRes, txRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 100 }),
        adminAPI.getLoans({ status: 'all', limit: 100 }),
        adminAPI.getAllTransactions({ limit: 100 })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setLoans(loansRes.data.loans || []);
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId) => {
    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      await adminAPI.approveLoan(loanId);
      setMessage('Loan approved successfully!');
      setSelectedLoan(null);
      setTimeout(() => fetchAllData(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectLoan = async (loanId) => {
    if (!rejectReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      await adminAPI.rejectLoan(loanId, { reason: rejectReason });
      setMessage('Loan rejected successfully!');
      setSelectedLoan(null);
      setRejectReason('');
      setTimeout(() => fetchAllData(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject loan');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getFilteredLoans = () => {
    if (loanFilter === 'all') return loans;
    return loans.filter(loan => loan.status === loanFilter);
  };

  if (user?.role !== 'admin') {
    return <div className="alert alert-error">Admin access required</div>;
  }

  if (loading) {
    return <div className="spinner" />;
  }

  const filteredLoans = getFilteredLoans();

  return (
    <div className="admin-panel">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, loans, and monitor system activity</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {activeTab === 'dashboard' && stats && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.totalUsers}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
          <div className="admin-stat-card warning">
            <span className="admin-stat-value">{stats.loanStats.pending}</span>
            <span className="admin-stat-label">Pending Loans</span>
          </div>
          <div className="admin-stat-card success">
            <span className="admin-stat-value">{stats.loanStats.approved}</span>
            <span className="admin-stat-label">Active Loans</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.totalTransactions}</span>
            <span className="admin-stat-label">Transactions</span>
          </div>
          <div className="admin-stat-card info">
            <span className="admin-stat-value">{formatCurrency(stats.totalDisbursed)}</span>
            <span className="admin-stat-label">Disbursed Loans</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{formatCurrency(stats.totalLoanAmount)}</span>
            <span className="admin-stat-label">Total Loan Requests</span>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          Loan Requests
        </button>
        <button
          className={`admin-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>All Users ({users.length})</h3>
          </div>
          <div className="users-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Balance</span>
              <span>Account Type</span>
              <span>Role</span>
              <span>Joined</span>
            </div>
            {users.map((u) => (
              <div key={u._id} className="table-row">
                <span className="user-name">{u.name}</span>
                <span className="user-email">{u.email}</span>
                <span className="user-balance">{formatCurrency(u.balance)}</span>
                <span className="account-type">{u.accountType}</span>
                <span className="user-role">
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                </span>
                <span className="created-date">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Loan Requests</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${loanFilter === 'all' ? 'active' : ''}`}
                onClick={() => setLoanFilter('all')}
              >
                All ({loans.length})
              </button>
              <button
                className={`filter-btn ${loanFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setLoanFilter('pending')}
              >
                Pending ({loans.filter(l => l.status === 'pending').length})
              </button>
              <button
                className={`filter-btn ${loanFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setLoanFilter('approved')}
              >
                Approved ({loans.filter(l => l.status === 'approved').length})
              </button>
              <button
                className={`filter-btn ${loanFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setLoanFilter('rejected')}
              >
                Rejected ({loans.filter(l => l.status === 'rejected').length})
              </button>
            </div>
          </div>

          {selectedLoan ? (
            <div className="loan-detail-view">
              <button className="btn-back" onClick={() => setSelectedLoan(null)}>
                ← Back to Loans
              </button>
              <div className="loan-detail-card">
                <div className="detail-header">
                  <h4>{selectedLoan.userId?.name}</h4>
                  <span className={`status-badge status-${selectedLoan.status}`}>
                    {selectedLoan.status.toUpperCase()}
                  </span>
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Email</span>
                    <span className="value">{selectedLoan.userId?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Loan Amount</span>
                    <span className="value">{formatCurrency(selectedLoan.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Purpose</span>
                    <span className="value">{selectedLoan.purpose}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration</span>
                    <span className="value">{selectedLoan.duration} months</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Monthly Income</span>
                    <span className="value">{formatCurrency(selectedLoan.monthlyIncome)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Employment Status</span>
                    <span className="value">{selectedLoan.employmentStatus}</span>
                  </div>
                </div>
                <div className="detail-section">
                  <span className="label">Reason</span>
                  <p className="reason-text">{selectedLoan.reason}</p>
                </div>

                {selectedLoan.status === 'pending' && (
                  <div className="action-section">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApproveLoan(selectedLoan._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : 'Approve Loan'}
                    </button>
                    <div className="reject-section">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="reject-input"
                      />
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRejectLoan(selectedLoan._id)}
                        disabled={actionLoading || !rejectReason.trim()}
                      >
                        {actionLoading ? 'Processing...' : 'Reject Loan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="loans-list">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <div key={loan._id} className="loan-card">
                    <div className="loan-header">
                      <div className="loan-title">
                        <h4>{loan.userId?.name}</h4>
                        <span className="loan-email">{loan.userId?.email}</span>
                      </div>
                      <span className={`status-badge status-${loan.status}`}>
                        {loan.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="loan-body">
                      <div className="loan-info-grid">
                        <span><strong>Amount:</strong> {formatCurrency(loan.amount)}</span>
                        <span><strong>Purpose:</strong> {loan.purpose}</span>
                        <span><strong>Duration:</strong> {loan.duration} months</span>
                        <span><strong>Income:</strong> {formatCurrency(loan.monthlyIncome)}</span>
                      </div>
                      <p className="loan-reason"><strong>Reason:</strong> {loan.reason.substring(0, 100)}...</p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">No {loanFilter !== 'all' ? loanFilter : ''} loans</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="admin-section">
          <div className="section-header">
            <h3>Recent Transactions ({transactions.length})</h3>
          </div>
          <div className="transactions-table">
            <div className="table-header">
              <span>User</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Category</span>
              <span>Description</span>
              <span>Date</span>
            </div>
            {transactions.slice(0, 50).map((tx) => (
              <div key={tx._id} className="table-row">
                <span className="tx-user">
                  {tx.userId?.name || 'Unknown'}
                </span>
                <span className={`tx-type type-${tx.type}`}>{tx.type}</span>
                <span className={`tx-amount ${tx.type === 'credit' || tx.type === 'loan' ? 'positive' : 'negative'}`}>
                  {tx.type === 'credit' || tx.type === 'loan' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
                <span className="tx-category">{tx.category}</span>
                <span className="tx-desc">{tx.description.substring(0, 30)}...</span>
                <span className="tx-date">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
