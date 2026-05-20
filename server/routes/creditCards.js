const express = require('express');
const router = express.Router();
const {
  addCreditCard,
  getCreditCards,
  getCreditCard,
  updateCreditCard,
  deleteCreditCard,
  setDefaultCard
} = require('../controllers/creditCardController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all user's credit cards
router.get('/', getCreditCards);

// Get single credit card
router.get('/:cardId', getCreditCard);

// Add new credit card
router.post('/', addCreditCard);

// Update credit card
router.put('/:cardId', updateCreditCard);

// Delete credit card
router.delete('/:cardId', deleteCreditCard);

// Set default card
router.post('/:cardId/set-default', setDefaultCard);

module.exports = router;
