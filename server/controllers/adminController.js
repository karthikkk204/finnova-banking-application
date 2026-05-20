const User = require('../models/User');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Get all users with their details
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// Get all loan requests
const getAllLoans = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const loans = await Loan.find(query)
      .populate('userId', 'name email phoneNumber')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Loan.countDocuments(query);

    const stats = {
      pending: await Loan.countDocuments({ status: 'pending' }),
      approved: await Loan.countDocuments({ status: 'approved' }),
      rejected: await Loan.countDocuments({ status: 'rejected' }),
      completed: await Loan.countDocuments({ status: 'completed' })
    };

    res.json({
      loans,
      total,
      stats,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get all loans error:', error);
    res.status(500).json({ message: 'Server error fetching loans.' });
  }
};

// Get single loan details
const getLoanDetail = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId)
      .populate('userId', 'name email phoneNumber balance')
      .lean();

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan detail error:', error);
    res.status(500).json({ message: 'Server error fetching loan.' });
  }
};

// Approve a loan request
const approveLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const adminId = req.userId;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending loans can be approved.' });
    }

    const user = await User.findById(loan.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create transaction for loan disbursement
    const transaction = new Transaction({
      userId: user._id,
      type: 'loan',
      amount: loan.amount,
      description: `Loan approved: $${loan.amount}`,
      category: 'loan',
      status: 'completed'
    });

    // Update loan status
    loan.status = 'approved';
    loan.approvedBy = adminId;
    loan.approvedAt = new Date();

    // Update user balance
    user.balance += loan.amount;

    // Save everything
    await Promise.all([transaction.save(), loan.save(), user.save()]);

    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'loan',
      title: 'Loan Approved',
      message: `Your loan request of $${loan.amount} has been approved. Amount has been credited to your account.`
    });

    res.json({
      message: 'Loan approved successfully.',
      loan,
      transaction
    });
  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({ message: 'Server error approving loan.' });
  }
};

// Reject a loan request
const rejectLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending loans can be rejected.' });
    }

    const user = await User.findById(loan.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update loan status
    loan.status = 'rejected';
    loan.rejectionReason = reason;
    loan.approvedBy = req.userId;
    loan.approvedAt = new Date();

    await loan.save();

    // Create notification
    await Notification.create({
      userId: user._id,
      type: 'loan',
      title: 'Loan Request Rejected',
      message: `Your loan request of $${loan.amount} has been rejected. Reason: ${reason}`
    });

    res.json({
      message: 'Loan rejected successfully.',
      loan
    });
  } catch (error) {
    console.error('Reject loan error:', error);
    res.status(500).json({ message: 'Server error rejecting loan.' });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const loanStats = {
      pending: await Loan.countDocuments({ status: 'pending' }),
      approved: await Loan.countDocuments({ status: 'approved' }),
      rejected: await Loan.countDocuments({ status: 'rejected' }),
      completed: await Loan.countDocuments({ status: 'completed' })
    };

    const totalLoanAmount = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDisbursed = await Loan.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentUsers = await User.find()
      .select('name email balance createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      totalUsers,
      totalTransactions,
      loanStats,
      totalLoanAmount: totalLoanAmount[0]?.total || 0,
      totalDisbursed: totalDisbursed[0]?.total || 0,
      recentUsers
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

module.exports = {
  getAllUsers,
  getAllLoans,
  getLoanDetail,
  approveLoan,
  rejectLoan,
  getDashboardStats
};
