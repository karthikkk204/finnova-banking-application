import React, { useState } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Transfer.css';

const Transfer = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ toEmail: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await transactionAPI.transfer({
        toEmail: formData.toEmail,
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      setMessage(res.data.message);
      updateUser({ ...user, balance: res.data.balance });
      setFormData({ toEmail: '', amount: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="transfer-page">
      <div className="page-header">
        <h1>Transfer Money</h1>
        <p>Send money to another user</p>
      </div>

      <div className="transfer-layout">
        <div className="card transfer-form-card">
          <h3>New Transfer</h3>
          <p className="balance-info">Available Balance: <strong>{formatCurrency(user?.balance || 0)}</strong></p>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="input-group">
              <label>Recipient Email</label>
              <input
                type="email"
                name="toEmail"
                value={formData.toEmail}
                onChange={handleChange}
                placeholder="recipient@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="input-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What's this for?"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Processing...' : 'Send Transfer'}
            </button>
          </form>
        </div>

        <div className="card transfer-info">
          <h3>Transfer Information</h3>
          <ul>
            <li>Transfers are instant and free</li>
            <li>Enter the recipient's registered email</li>
            <li>You cannot transfer to yourself</li>
            <li>Ensure the email is correct before sending</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
