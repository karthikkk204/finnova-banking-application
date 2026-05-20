import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BalanceCard3D from '../components/BalanceCard3D';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const CATEGORY_COLORS = {
  food: '#f59e0b',
  travel: '#3b82f6',
  bills: '#ef4444',
  transfer: '#8b5cf6',
  loan: '#10b981',
  salary: '#22c55e',
  shopping: '#ec4899',
  other: '#6b7280'
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await transactionAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return <div className="spinner" />;
  }

  const categoryData = stats?.categoryStats?.map((cat) => ({
    name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
    value: cat.total,
    fill: CATEGORY_COLORS[cat._id] || CATEGORY_COLORS.other
  })) || [];

  // Group monthly data by week for better visualization
  const monthlyData = (stats?.monthlyTransactions || []).reduce((weeks, transaction) => {
    const date = new Date(transaction._id);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const existingWeek = weeks.find(w => w.weekKey === weekKey);
    if (existingWeek) {
      existingWeek.total += transaction.total;
    } else {
      weeks.push({
        weekKey,
        name: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        total: transaction.total
      });
    }
    return weeks;
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <BalanceCard3D balance={stats?.balance || user?.balance || 0} />

        <div className="stat-card">
          <span className="stat-label">Loan Status</span>
          <span className={`stat-value loan-${stats?.loanStatus || 'none'}`}>
            {stats?.loanStatus === 'none' ? 'No Active Loan' : stats?.loanStatus}
          </span>
          {stats?.loanAmount > 0 && (
            <span className="stat-sub">{formatCurrency(stats.loanAmount)} remaining</span>
          )}
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Monthly Overview</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No transactions this month</div>
          )}
        </div>

        <div className="card chart-card">
          <h3>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No spending data</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Recent Transactions</h3>
        {stats?.recentTransactions?.length > 0 ? (
          <div className="transactions-list">
            {stats.recentTransactions.map((tx) => (
              <div key={tx._id} className="transaction-item">
                <div className="tx-info">
                  <span className={`tx-type tx-${tx.type}`}>{tx.type}</span>
                  <span className="tx-desc">{tx.description}</span>
                </div>
                <div className="tx-meta">
                  <span className={`tx-amount ${tx.type === 'credit' || tx.type === 'loan' ? 'positive' : ''}`}>
                    {tx.type === 'credit' || tx.type === 'loan' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No recent transactions</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
