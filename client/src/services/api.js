import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  deposit: (data) => api.post('/transactions/deposit', data),
  requestLoan: (data) => api.post('/transactions/loan/request', data),
  repayLoan: (data) => api.post('/transactions/loan/repay', data),
  getStats: () => api.get('/transactions/stats')
};

export const creditCardAPI = {
  getAll: () => api.get('/credit-cards'),
  get: (cardId) => api.get(`/credit-cards/${cardId}`),
  create: (data) => api.post('/credit-cards', data),
  update: (cardId, data) => api.put(`/credit-cards/${cardId}`, data),
  delete: (cardId) => api.delete(`/credit-cards/${cardId}`),
  setDefault: (cardId) => api.post(`/credit-cards/${cardId}/set-default`)
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getLoans: (params) => api.get('/admin/loans', { params }),
  getLoanDetail: (loanId) => api.get(`/admin/loans/${loanId}`),
  approveLoan: (loanId) => api.post(`/admin/loans/${loanId}/approve`),
  rejectLoan: (loanId, data) => api.post(`/admin/loans/${loanId}/reject`, data),
  getAllTransactions: (params) => api.get('/transactions/all', { params })
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export default api;
