const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  transfer,
  requestLoan,
  repayLoan,
  getStats,
  getAllTransactions,
  deposit
} = require('../controllers/transactionController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', auth, getTransactions);
router.post('/', auth, createTransaction);
router.post('/transfer', auth, transfer);
router.post('/deposit', auth, deposit);
router.post('/loan/request', auth, requestLoan);
router.post('/loan/repay', auth, repayLoan);
router.get('/stats', auth, getStats);
router.get('/all', auth, adminAuth, getAllTransactions);

module.exports = router;
