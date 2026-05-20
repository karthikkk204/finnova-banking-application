const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Loan = require('./models/Loan');
const CreditCard = require('./models/CreditCard');

const seedUsers = [
  { name: 'Admin User', email: 'admin@finova.com', password: 'admin123', role: 'admin', balance: 50000 },
  { name: 'Sarah Johnson', email: 'sarah@finova.com', password: 'user123', balance: 15420.50 },
  { name: 'Michael Chen', email: 'michael@finova.com', password: 'user123', balance: 8750.25 },
  { name: 'Emily Davis', email: 'emily@finova.com', password: 'user123', balance: 22300.00 },
  { name: 'James Wilson', email: 'james@finova.com', password: 'user123', balance: 5600.75 },
  { name: 'Amanda Martinez', email: 'amanda@finova.com', password: 'user123', balance: 18900.00 },
  { name: 'Robert Brown', email: 'robert@finova.com', password: 'user123', balance: 12450.30 },
  { name: 'Lisa Anderson', email: 'lisa@finova.com', password: 'user123', balance: 9875.60 },
  { name: 'David Taylor', email: 'david@finova.com', password: 'user123', balance: 45000.00 },
  { name: 'Jennifer Garcia', email: 'jennifer@finova.com', password: 'user123', balance: 7650.40 },
  { name: 'Christopher Lee', email: 'chris@finova.com', password: 'user123', balance: 34500.00 },
  { name: 'Michelle Thomas', email: 'michelle@finova.com', password: 'user123', balance: 11200.50 },
  { name: 'Daniel White', email: 'daniel@finova.com', password: 'user123', balance: 8900.25 },
  { name: 'Jessica Harris', email: 'jessica@finova.com', password: 'user123', balance: 21000.00 },
  { name: 'Matthew Jackson', email: 'matthew@finova.com', password: 'user123', balance: 6700.75 }
];

const categories = ['food', 'travel', 'bills', 'transfer', 'salary', 'shopping', 'other'];
const descriptions = {
  food: ['Grocery shopping at Whole Foods', 'Coffee at Starbucks', 'Lunch at Chipotle', 'Dinner at Olive Garden', 'Movie snacks'],
  travel: ['Uber ride', 'Gas station', 'Flight to NYC', 'Hotel booking', 'Train ticket'],
  bills: ['Electric bill', 'Internet bill', 'Phone bill', 'Streaming subscription', 'Insurance payment'],
  salary: ['Monthly salary', 'Freelance payment', 'Bonus', 'Commission', 'Reimbursement'],
  shopping: ['Amazon purchase', 'Clothing at Zara', 'Electronics at Best Buy', 'Home goods', 'Online order'],
  transfer: ['Rent payment', 'Friend transfer', 'Family support', 'Split bill', 'Gift sent'],
  other: ['ATM withdrawal', 'Miscellaneous', 'Charity donation', 'Service fee', 'Other expense']
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Loan.deleteMany({});
    await CreditCard.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = [];
    const userMap = {};

    for (const userData of seedUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'user',
        balance: userData.balance,
        loanStatus: 'none',
        loanAmount: 0
      });

      await user.save();
      createdUsers.push(user);
      userMap[userData.email] = user;
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    const transactionTypes = [
      { type: 'credit', categories: ['salary', 'transfer'] },
      { type: 'debit', categories: ['food', 'travel', 'bills', 'shopping', 'other'] }
    ];

    for (const user of createdUsers) {
      const numTransactions = Math.floor(Math.random() * 30) + 20;

      for (let i = 0; i < numTransactions; i++) {
        const typeObj = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const category = typeObj.categories[Math.floor(Math.random() * typeObj.categories.length)];
        const descList = descriptions[category];
        const description = descList[Math.floor(Math.random() * descList.length)];

        
        // Create transactions for current month (April 2026) and some for past months
        let daysAgo;
        if (i < 8) {
          // At least 8 transactions in current month
          daysAgo = Math.floor(Math.random() * 27);
        } else {
          // Rest in past months
          daysAgo = Math.floor(Math.random() * 90);
        }
        
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const transaction = new Transaction({
          userId: user._id,
          type: typeObj.type,
          amount,
          description,
          category,
          status: 'completed',
          createdAt
        });

        await transaction.save();
      }

      // Add some credit cards for users
      if (user.role !== 'admin') {
        const cardTypes = ['visa', 'mastercard', 'amex'];
        const numCards = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numCards; i++) {
          const cardNumber = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
          const expiryYear = 2025 + Math.floor(Math.random() * 5);
          const expiryMonth = Math.floor(Math.random() * 12) + 1;
          
          const card = new CreditCard({
            userId: user._id,
            cardholderName: user.name,
            cardNumber: cardNumber.toString(),
            expiryMonth,
            expiryYear,
            cvv: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
            cardType: cardTypes[Math.floor(Math.random() * cardTypes.length)],
            creditLimit: 5000 + Math.floor(Math.random() * 15000),
            isDefault: i === 0
          });
          
          await card.save();
          user.creditCards.push(card._id);
        }
        
        await user.save();
      }

      // Add a loan for some users
      if (user.role !== 'admin' && Math.random() > 0.7) {
        const loanAmount = 5000 + Math.floor(Math.random() * 45000);
        const loan = new Loan({
          userId: user._id,
          amount: loanAmount,
          remainingAmount: loanAmount * 0.8,
          purpose: ['personal', 'business', 'education', 'home', 'vehicle'][Math.floor(Math.random() * 5)],
          duration: 12 + Math.floor(Math.random() * 48),
          monthlyIncome: 3000 + Math.floor(Math.random() * 7000),
          employmentStatus: ['employed', 'self-employed', 'unemployed'][Math.floor(Math.random() * 2)],
          reason: 'Loan for personal use',
          status: Math.random() > 0.5 ? 'approved' : 'pending',
          approvedAt: new Date(),
          approvedBy: createdUsers[0]._id
        });
        
        await loa

        await transaction.save();
      }
    }

    for (const user of createdUsers) {
      const userTransactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
      const balanceFromTx = userTransactions
        .filter(t => t.type === 'credit' || t.type === 'loan')
        .reduce((sum, t) => sum + t.amount, 0) -
        userTransactions
        .filter(t => t.type === 'debit' || t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0);

      if (user.role !== 'admin') {
        user.balance = 1000 + balanceFromTx;
        await user.save();
      }
    }

    console.log(`\nSeeded ${createdUsers.length} users`);
    console.log(`Created transactions for all users`);

    console.log('\n--- Login Credentials ---');
    createdUsers.forEach(user => {
      const password = seedUsers.find(u => u.email === user.email)?.password;
      console.log(`${user.email} / ${password}`);
    });

    await mongoose.disconnect();
    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
