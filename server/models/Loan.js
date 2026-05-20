const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  purpose: {
    type: String,
    enum: ['personal', 'business', 'education', 'home', 'vehicle', 'medical', 'other'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 360
  },
  monthlyIncome: {
    type: Number,
    required: true,
    min: 0
  },
  employmentStatus: {
    type: String,
    enum: ['employed', 'self-employed', 'unemployed', 'student', 'retired', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Loan', loanSchema);
