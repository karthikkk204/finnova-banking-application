const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');

// Get user's transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { userId: req.userId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions.' });
  }
};

// Create a simple transaction (credit/debit)
const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category } = req.body;

    if (!type || !amount || !description) {
      return res.status(400).json({ message: 'Type, amount, and description are required.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (type === 'debit' && user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      description,
      category: category || 'other',
      status: 'completed'
    });

    if (type === 'credit') {
      user.balance += amount;
    } else if (type === 'debit') {
      user.balance -= amount;
    }

    await Promise.all([transaction.save(), user.save()]);

    res.status(201).json({ transaction, balance: user.balance });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction.' });
  }
};

// Transfer money between users
const transfer = async (req, res) => {
  try {
    const { toEmail, amount, description } = req.body;

    // Validation
    if (!toEmail || !amount || !description) {
      return res.status(400).json({ message: 'Recipient email, amount, and description are required.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive.' });
    }

    if (req.user.email === toEmail) {
      return res.status(400).json({ message: 'Cannot transfer to yourself.' });
    }

    // Get sender
    const sender = await User.findById(req.userId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found.' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Get recipient
    const recipient = await User.findOne({ email: toEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }

    // Create debit transaction for sender
    const debitTransaction = new Transaction({
      userId: sender._id,
      type: 'transfer',
      amount,
      description,
      category: 'transfer',
      toUserId: recipient._id,
      status: 'completed'
    });

    // Create credit transaction for recipient
    const creditTransaction = new Transaction({
      userId: recipient._id,
      type: 'transfer',
      amount,
      description,
      category: 'transfer',
      fromUserId: sender._id,
      status: 'completed'
    });

    // Update balances
    sender.balance -= amount;
    recipient.balance += amount;

    // Save everything
    await Promise.all([
      debitTransaction.save(),
      creditTransaction.save(),
      sender.save(),
      recipient.save()
    ]);

    // Create notifications
    await Promise.all([
      Notification.create({
        userId: sender._id,
        type: 'transfer',
        title: 'Transfer Successful',
        message: `You transferred $${amount} to ${recipient.name}.`
      }),
      Notification.create({
        userId: recipient._id,
        type: 'transfer',
        title: 'Transfer Received',
        message: `You received $${amount} from ${sender.name}.`
      })
    ]);

    res.json({
      message: 'Transfer successful.',
      transaction: debitTransaction,
      balance: sender.balance
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error during transfer.' });
  }
};

// Request a new loan
const requestLoan = async (req, res) => {
  try {
    const { amount, purpose, duration, monthlyIncome, employmentStatus, reason } = req.body;

    // Validation
    if (!amount || !purpose || !duration || monthlyIncome === undefined || !employmentStatus || !reason) {
      return res.status(400).json({ message: 'All loan fields are required.' });
    }

    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum loan amount is $100.' });
    }

    if (duration < 1 || duration > 360) {
      return res.status(400).json({ message: 'Loan duration must be between 1 and 360 months.' });
    }

    if (monthlyIncome < 0) {
      return res.status(400).json({ message: 'Monthly income cannot be negative.' });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({ message: 'Reason must be at least 10 characters.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check for existing pending or approved loans
    const existingLoan = await Loan.findOne({
      userId: req.userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingLoan) {
      return res.status(400).json({ message: 'You already have a pending or active loan. Complete or reject it first.' });
    }

    // Create loan request
    const loan = new Loan({
      userId: req.userId,
      amount,
      remainingAmount: amount,
      purpose,
      duration,
      monthlyIncome,
      employmentStatus,
      reason,
      status: 'pending'
    });

    await loan.save();

    // Create notification for user
    await Notification.create({
      userId: user._id,
      type: 'loan',
      title: 'Loan Request Submitted',
      message: `Your loan request for $${amount} has been submitted and is pending admin approval.`
    });

    res.status(201).json({
      message: 'Loan request submitted successfully.',
      loan
    });
  } catch (error) {
    console.error('Loan request error:', error);
    res.status(500).json({ message: 'Server error requesting loan.' });
  }
};

// Repay loan (partial or full)
const repayLoan = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid repayment amount is required.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find active loan
    const loan = await Loan.findOne({
      userId: req.userId,
      status: 'approved'
    });

    if (!loan) {
      return res.status(400).json({ message: 'No active loan to repay.' });
    }

    if (amount > user.balance) {
      return res.status(400).json({ message: 'Insufficient balance for repayment.' });
    }

    if (amount > loan.remainingAmount) {
      return res.status(400).json({ message: `Maximum repayment amount is $${loan.remainingAmount}.` });
    }

    // Create repayment transaction
    const transaction = new Transaction({
      userId: user._id,
      type: 'debit',
      amount,
      description: `Loan repayment: $${amount}`,
      category: 'loan',
      status: 'completed'
    });

    // Update balances
    user.balance -= amount;
    loan.remainingAmount -= amount;

    // Check if loan is fully repaid
    if (loan.remainingAmount <= 0) {
      loan.status = 'completed';
      loan.completedAt = new Date();
    }

    await Promise.all([transaction.save(), user.save(), loan.save()]);

    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'loan',
      title: 'Loan Repayment',
      message: `You repaid $${amount} towards your loan. Remaining: $${loan.remainingAmount}`
    });

    res.json({
      message: 'Loan repayment successful.',
      transaction,
      balance: user.balance,
      remainingLoan: loan.remainingAmount,
      loanStatus: loan.status
    });
  } catch (error) {
    console.error('Repay loan error:', error);
    res.status(500).json({ message: 'Server error repaying loan.' });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Monthly transactions grouped by day
    const monthlyTransactions = await Transaction.aggregate([
      { $match: {
          userId: new (require('mongoose').Types.ObjectId)(userId),
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category stats (only for this user's transactions)
    const categoryStats = await Transaction.aggregate([
      { $match: {
          userId: new (require('mongoose').Types.ObjectId)(userId),
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({
      userId: new (require('mongoose').Types.ObjectId)(userId)
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type amount description category createdAt')
      .lean();

    // User info
    const user = await User.findById(userId).select('-password').lean();

    // Active loan
    const activeLoan = await Loan.findOne({
      userId,
      status: 'approved'
    }).lean();

    res.json({
      balance: user.balance,
      monthlyTransactions,
      categoryStats,
      recentTransactions,
      loanStatus: activeLoan ? 'approved' : 'none',
      loanAmount: activeLoan ? activeLoan.remainingAmount : 0,
      activeLoan: activeLoan || null,
      user: {
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

// Get all transactions (admin)
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .lean();

    const total = await Transaction.countDocuments();

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions.' });
  }
};

// Deposit money
const deposit = async (req, res) => {
  try {
    const { amount, description, cardId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If using a credit card, verify it exists and is active
    if (cardId) {
      const CreditCard = require('../models/CreditCard');
      const card = await CreditCard.findById(cardId);
      if (!card || !card.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive credit card.' });
      }
      if (card.userId.toString() !== req.userId) {
        return res.status(403).json({ message: 'This card does not belong to you.' });
      }
    }

    // Create deposit transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: 'deposit',
      amount,
      description: description || 'Bank deposit',
      category: 'salary',
      status: 'completed'
    });

    // Update user balance
    user.balance += amount;

    await Promise.all([transaction.save(), user.save()]);

    res.status(201).json({
      transaction,
      balance: user.balance,
      message: 'Deposit successful!'
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Server error processing deposit.' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  transfer,
  requestLoan,
  repayLoan,
  getStats,
  getAllTransactions,
  deposit
};
