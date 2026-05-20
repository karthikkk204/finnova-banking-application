import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import AnimatedTransactionIcon from '../components/AnimatedTransactionIcon';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', category: 'all', sortBy: 'createdAt', order: 'desc' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.getAll({ ...filter, page, limit: 10 });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <p>View and manage your transaction history</p>
      </div>

      <div className="card filters-bar">
        <div className="filter-group">
          <label>Type</label>
          <select value={filter.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
            <option value="all">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="transfer">Transfer</option>
            <option value="loan">Loan</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select value={filter.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="all">All</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="bills">Bills</option>
            <option value="transfer">Transfer</option>
            <option value="loan">Loan</option>
            <option value="salary">Salary</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select value={filter.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order</label>
          <select value={filter.order} onChange={(e) => handleFilterChange('order', e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : transactions.length > 0 ? (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx._id} className="transaction-row">
              <AnimatedTransactionIcon 
                type={tx.type === 'credit' || tx.type === 'loan' ? 'incoming' : 'outgoing'} 
                amount={tx.amount}
              />
              <div className="tx-details">
                <span className="tx-description">{tx.description}</span>
                <span className="tx-category">{tx.category} • {new Date(tx.createdAt).toLocaleString()}</span>
              </div>
              <div className={`tx-amount tx-amount-${tx.type === 'credit' || tx.type === 'loan' ? 'positive' : 'negative'}`}>
                {tx.type === 'credit' || tx.type === 'loan' ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost">
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost">
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="card empty-state">No transactions found</div>
      )}
    </div>
  );
};

export default Transactions;
