const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardholderName: {
    type: String,
    required: true,
    trim: true
  },
  cardNumber: {
    type: String,
    required: true,
    // Store last 4 digits only for security
    validate: {
      validator: function(v) {
        return /^\d{16}$/.test(v);
      },
      message: 'Card number must be 16 digits'
    }
  },
  expiryMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  expiryYear: {
    type: Number,
    required: true,
    min: 2024,
    max: 2100
  },
  cvv: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{3,4}$/.test(v);
      },
      message: 'CVV must be 3 or 4 digits'
    }
  },
  cardType: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  creditLimit: {
    type: Number,
    default: 5000
  },
  usedCredit: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

creditCardSchema.index({ userId: 1 });
creditCardSchema.index({ isDefault: 1 });

module.exports = mongoose.model('CreditCard', creditCardSchema);
