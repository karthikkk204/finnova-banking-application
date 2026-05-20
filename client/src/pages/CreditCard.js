import React, { useState, useEffect } from 'react';
import { creditCardAPI } from '../services/api';
import './CreditCard.css';

const CreditCard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: 'visa',
    creditLimit: 5000
  });
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await creditCardAPI.getAll();
      setCards(res.data.cards || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch credit cards');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditLimit' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.cardholderName || !formData.cardNumber || !formData.expiryMonth || 
        !formData.expiryYear || !formData.cvv) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await creditCardAPI.create(formData);
      setSuccess('Credit card added successfully!');
      setFormData({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardType: 'visa',
        creditLimit: 5000
      });
      setShowForm(false);
      await fetchCards();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add credit card');
    }
  };

  const handleDelete = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await creditCardAPI.delete(cardId);
        setSuccess('Credit card deleted successfully!');
        await fetchCards();
        setTimeout(() => setSuccess(''), 5000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete credit card');
      }
    }
  };

  const handleSetDefault = async (cardId) => {
    try {
      await creditCardAPI.setDefault(cardId);
      setSuccess('Default card updated successfully!');
      await fetchCards();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default card');
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="credit-card-container">
      <div className="page-header">
        <div>
          <h1>Credit Cards</h1>
          <p>Manage your credit cards and payment methods</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-card-btn"
        >
          {showForm ? 'Cancel' : '+ Add Card'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="add-card-form-container">
          <div className="add-card-form">
            <h2>Add New Credit Card</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Cardholder Name *</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                    handleChange({ target: { name: 'cardNumber', value: val } });
                  }}
                  placeholder="1234567812345678"
                  maxLength="16"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month *</label>
                  <select
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleChange}
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expiry Year *</label>
                  <select
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleChange}
                    required
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      handleChange({ target: { name: 'cvv', value: val } });
                    }}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Card Type *</label>
                  <select
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleChange}
                    required
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="amex">American Express</option>
                    <option value="discover">Discover</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Credit Limit</label>
                  <input
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleChange}
                    min="1000"
                    max="50000"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">Add Credit Card</button>
            </form>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {cards.length === 0 ? (
          <div className="no-cards-message">
            <p>No credit cards added yet.</p>
            <button onClick={() => setShowForm(true)} className="add-card-btn">
              Add Your First Card
            </button>
          </div>
        ) : (
          cards.map(card => (
            <div key={card._id} className="card-container">
              <div className={`card card-${card.cardType}`}>
                <div className="card-header">
                  <span className="card-type">{card.cardType.toUpperCase()}</span>
                  {card.isDefault && <span className="default-badge">Default</span>}
                </div>
                <div className="card-number">{card.cardNumber}</div>
                <div className="card-footer">
                  <div>
                    <span className="card-label">CARDHOLDER</span>
                    <span className="card-value">{card.cardholderName}</span>
                  </div>
                  <div>
                    <span className="card-label">EXPIRES</span>
                    <span className="card-value">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}</span>
                  </div>
                </div>
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <span className="detail-label">Credit Limit</span>
                  <span className="detail-value">${card.creditLimit}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Used Credit</span>
                  <span className="detail-value">${card.usedCredit}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Available</span>
                  <span className="detail-value">${card.availableCredit}</span>
                </div>
              </div>

              <div className="card-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(card.usedCredit / card.creditLimit) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {((card.usedCredit / card.creditLimit) * 100).toFixed(0)}% used
                </span>
              </div>

              <div className="card-actions">
                {!card.isDefault && (
                  <button
                    onClick={() => handleSetDefault(card._id)}
                    className="action-btn primary"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(card._id)}
                  className="action-btn danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreditCard;
