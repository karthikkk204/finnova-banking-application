const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllLoans,
  getLoanDetail,
  approveLoan,
  rejectLoan,
  getDashboardStats
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', auth, adminAuth, getDashboardStats);

// Users management
router.get('/users', auth, adminAuth, getAllUsers);

// Loans management
router.get('/loans', auth, adminAuth, getAllLoans);
router.get('/loans/:loanId', auth, adminAuth, getLoanDetail);
router.post('/loans/:loanId/approve', auth, adminAuth, approveLoan);
router.post('/loans/:loanId/reject', auth, adminAuth, rejectLoan);

module.exports = router;
