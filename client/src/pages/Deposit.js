import React, { useState } from 'react';
import { transactionAPI } from '../services/api';
import './Deposit.css';

const Deposit = () => {
  const [formData, setFormData] = useState({
    amount: '',
    description: 'Bank deposit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      const res = await transactionAPI.deposit(formData);
      setSuccess(`Successfully deposited $${formData.amount}! New balance: $${res.data.balance.toFixed(2)}`);
      setFormData({
        amount: '',
        description: 'Bank deposit'
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-container">
      <div className="page-header">
        <h1>Deposit Money</h1>
        <p>Add funds to your account</p>
      </div>

      <div className="deposit-content">
        <div className="deposit-card">
          <form onSubmit={handleSubmit} className="deposit-form">
            <div className="form-group">
              <label htmlFor="amount">Deposit Amount *</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="amount-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Reason for deposit"
                className="form-input"
              />
            </div>

            <div className="quick-amounts">
              <p className="quick-label">Quick Select:</p>
              <div className="amount-buttons">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: '100' }))}
                  className="amount-btn"
                >
                  $100
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: '500' }))}
                  className="amount-btn"
                >
                  $500
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: '1000' }))}
                  className="amount-btn"
                >
                  $1000
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, amount: '5000' }))}
                  className="amount-btn"
                >
                  $5000
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button
              type="submit"
              disabled={loading}
              className="deposit-btn"
            >
              {loading ? 'Processing...' : 'Deposit Now'}
            </button>
          </form>

          <div className="deposit-info">
            <h3>Deposit Information</h3>
            <ul>
              <li>✓ Deposits are processed instantly</li>
              <li>✓ Minimum deposit: $1</li>
              <li>✓ No fees applied</li>
              <li>✓ Use your credit card or bank account</li>
              <li>✓ Safe and secure transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
