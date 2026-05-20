import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Loan.css';

const Loan = () => {
  const { user, updateUser } = useAuth();
  const [activeLoan, setActiveLoan] = useState(null);
  const [loanForm, setLoanForm] = useState({
    amount: '',
    purpose: 'personal',
    duration: '12',
    monthlyIncome: '',
    employmentStatus: 'employed',
    reason: ''
  });
  const [repayAmount, setRepayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch active loan details from stats
    const fetchStats = async () => {
      try {
        const res = await transactionAPI.getStats();
        if (res.data.activeLoan) {
          setActiveLoan(res.data.activeLoan);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleLoanInputChange = (e) => {
    setLoanForm({
      ...loanForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await transactionAPI.requestLoan({
        amount: parseFloat(loanForm.amount),
        purpose: loanForm.purpose,
        duration: parseInt(loanForm.duration),
        monthlyIncome: parseFloat(loanForm.monthlyIncome),
        employmentStatus: loanForm.employmentStatus,
        reason: loanForm.reason
      });
      setMessage(res.data.message);
      setLoanForm({
        amount: '',
        purpose: 'personal',
        duration: '12',
        monthlyIncome: '',
        employmentStatus: 'employed',
        reason: ''
      });
      // Refresh stats
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Loan request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await transactionAPI.repayLoan({ amount: parseFloat(repayAmount) });
      setMessage(res.data.message);
      updateUser({ ...user, balance: res.data.balance });
      setRepayAmount('');
      setActiveLoan(prev => ({
        ...prev,
        remainingAmount: res.data.remainingLoan,
        status: res.data.loanStatus
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Repayment failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const canRequestLoan = !activeLoan || activeLoan.status === 'rejected' || activeLoan.status === 'completed';
  const canRepayLoan = activeLoan && activeLoan.status === 'approved';

  return (
    <div className="loan-page">
      <div className="page-header">
        <h1>Loan Management</h1>
        <p>Request a loan or manage your active loan</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {activeLoan && (
        <div className="loan-status-card">
          <div className="loan-status-header">
            <h3>Active Loan Status</h3>
            <span className={`loan-status-badge status-${activeLoan.status}`}>
              {activeLoan.status?.toUpperCase()}
            </span>
          </div>
          <div className="loan-details-grid">
            <div className="loan-detail">
              <span className="loan-label">Loan Amount</span>
              <span className="loan-value">{formatCurrency(activeLoan.amount)}</span>
            </div>
            <div className="loan-detail">
              <span className="loan-label">Purpose</span>
              <span className="loan-value">{activeLoan.purpose}</span>
            </div>
            <div className="loan-detail">
              <span className="loan-label">Duration</span>
              <span className="loan-value">{activeLoan.duration} months</span>
            </div>
            <div className="loan-detail">
              <span className="loan-label">Remaining Amount</span>
              <span className="loan-value">{formatCurrency(activeLoan.remainingAmount)}</span>
            </div>
            <div className="loan-detail">
              <span className="loan-label">Monthly Income</span>
              <span className="loan-value">{formatCurrency(activeLoan.monthlyIncome)}</span>
            </div>
            <div className="loan-detail">
              <span className="loan-label">Employment Status</span>
              <span className="loan-value">{activeLoan.employmentStatus}</span>
            </div>
          </div>
        </div>
      )}

      <div className="loan-actions">
        {canRequestLoan && (
          <div className="card loan-action-card">
            <h3>Request New Loan</h3>
            <p className="card-description">Fill in your loan details below</p>
            <form onSubmit={handleRequestLoan} className="loan-form">
              <div className="input-group">
                <label>Loan Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={loanForm.amount}
                  onChange={handleLoanInputChange}
                  placeholder="Minimum $100"
                  min="100"
                  step="100"
                  required
                />
              </div>

              <div className="input-group">
                <label>Purpose *</label>
                <select
                  name="purpose"
                  value={loanForm.purpose}
                  onChange={handleLoanInputChange}
                  required
                >
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="home">Home</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Duration (months) *</label>
                <input
                  type="number"
                  name="duration"
                  value={loanForm.duration}
                  onChange={handleLoanInputChange}
                  min="1"
                  max="360"
                  step="1"
                  required
                />
              </div>

              <div className="input-group">
                <label>Monthly Income *</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={loanForm.monthlyIncome}
                  onChange={handleLoanInputChange}
                  placeholder="0.00"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div className="input-group">
                <label>Employment Status *</label>
                <select
                  name="employmentStatus"
                  value={loanForm.employmentStatus}
                  onChange={handleLoanInputChange}
                  required
                >
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Reason/Description *</label>
                <textarea
                  name="reason"
                  value={loanForm.reason}
                  onChange={handleLoanInputChange}
                  placeholder="Explain why you need this loan (minimum 10 characters)"
                  minLength="10"
                  rows="4"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Loan Request'}
              </button>
            </form>
          </div>
        )}

        {canRepayLoan && (
          <div className="card loan-action-card">
            <h3>Repay Loan</h3>
            <div className="repay-info-box">
              <p className="repay-info">
                Remaining Amount: <strong>{formatCurrency(activeLoan.remainingAmount)}</strong>
              </p>
              <p className="repay-info">
                Your Balance: <strong>{formatCurrency(user?.balance || 0)}</strong>
              </p>
            </div>
            <form onSubmit={handleRepayLoan} className="loan-form">
              <div className="input-group">
                <label>Repayment Amount *</label>
                <input
                  type="number"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max={user?.balance}
                  step="1"
                  required
                />
              </div>
              <button type="submit" className="btn btn-success btn-full" disabled={loading || (user?.balance || 0) <= 0}>
                {loading ? 'Processing...' : 'Repay Loan'}
              </button>
            </form>
          </div>
        )}

        {!canRequestLoan && !canRepayLoan && activeLoan && (
          <div className="card alert alert-info">
            <p>Your loan request is being reviewed. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loan;
