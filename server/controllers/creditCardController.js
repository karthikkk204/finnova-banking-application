const CreditCard = require('../models/CreditCard');
const User = require('../models/User');

// Add a new credit card
const addCreditCard = async (req, res) => {
  try {
    const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv, cardType, creditLimit } = req.body;

    // Validation
    if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardType) {
      return res.status(400).json({ message: 'All card details are required.' });
    }

    // Check if card already exists
    const existingCard = await CreditCard.findOne({
      userId: req.userId,
      cardNumber
    });

    if (existingCard) {
      return res.status(400).json({ message: 'This card is already registered.' });
    }

    // Check if card has expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return res.status(400).json({ message: 'Card has already expired.' });
    }

    // Create new card
    const newCard = new CreditCard({
      userId: req.userId,
      cardholderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardType,
      creditLimit: creditLimit || 5000
    });

    // If this is the first card, set it as default
    const existingCards = await CreditCard.countDocuments({ userId: req.userId });
    if (existingCards === 0) {
      newCard.isDefault = true;
    }

    await newCard.save();

    // Add card to user's creditCards array
    await User.findByIdAndUpdate(req.userId, {
      $push: { creditCards: newCard._id }
    });

    // Return card with last 4 digits only
    const cardResponse = {
      _id: newCard._id,
      cardholderName: newCard.cardholderName,
      cardNumber: `****-****-****-${cardNumber.slice(-4)}`,
      expiryMonth: newCard.expiryMonth,
      expiryYear: newCard.expiryYear,
      cardType: newCard.cardType,
      isDefault: newCard.isDefault,
      isActive: newCard.isActive,
      creditLimit: newCard.creditLimit,
      usedCredit: newCard.usedCredit
    };

    res.status(201).json({
      message: 'Credit card added successfully!',
      card: cardResponse
    });
  } catch (error) {
    console.error('Add credit card error:', error);
    res.status(500).json({ message: 'Server error adding credit card.' });
  }
};

// Get all credit cards for user
const getCreditCards = async (req, res) => {
  try {
    const cards = await CreditCard.find({ userId: req.userId }).select('-cvv');

    // Mask card numbers
    const maskedCards = cards.map(card => ({
      _id: card._id,
      cardholderName: card.cardholderName,
      cardNumber: `****-****-****-${card.cardNumber.slice(-4)}`,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardType: card.cardType,
      isDefault: card.isDefault,
      isActive: card.isActive,
      creditLimit: card.creditLimit,
      usedCredit: card.usedCredit,
      availableCredit: card.creditLimit - card.usedCredit,
      createdAt: card.createdAt
    }));

    res.json({
      cards: maskedCards,
      count: maskedCards.length
    });
  } catch (error) {
    console.error('Get credit cards error:', error);
    res.status(500).json({ message: 'Server error fetching credit cards.' });
  }
};

// Get single credit card
const getCreditCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await CreditCard.findOne({
      _id: cardId,
      userId: req.userId
    }).select('-cvv');

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found.' });
    }

    const cardResponse = {
      _id: card._id,
      cardholderName: card.cardholderName,
      cardNumber: `****-****-****-${card.cardNumber.slice(-4)}`,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardType: card.cardType,
      isDefault: card.isDefault,
      isActive: card.isActive,
      creditLimit: card.creditLimit,
      usedCredit: card.usedCredit,
      availableCredit: card.creditLimit - card.usedCredit,
      createdAt: card.createdAt
    };

    res.json(cardResponse);
  } catch (error) {
    console.error('Get credit card error:', error);
    res.status(500).json({ message: 'Server error fetching credit card.' });
  }
};

// Update credit card
const updateCreditCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { cardholderName, creditLimit, isActive } = req.body;

    const card = await CreditCard.findOne({
      _id: cardId,
      userId: req.userId
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found.' });
    }

    if (cardholderName) card.cardholderName = cardholderName;
    if (creditLimit) card.creditLimit = creditLimit;
    if (typeof isActive === 'boolean') card.isActive = isActive;

    await card.save();

    const cardResponse = {
      _id: card._id,
      cardholderName: card.cardholderName,
      cardNumber: `****-****-****-${card.cardNumber.slice(-4)}`,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardType: card.cardType,
      isDefault: card.isDefault,
      isActive: card.isActive,
      creditLimit: card.creditLimit,
      usedCredit: card.usedCredit
    };

    res.json({
      message: 'Credit card updated successfully!',
      card: cardResponse
    });
  } catch (error) {
    console.error('Update credit card error:', error);
    res.status(500).json({ message: 'Server error updating credit card.' });
  }
};

// Delete credit card
const deleteCreditCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await CreditCard.findOne({
      _id: cardId,
      userId: req.userId
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found.' });
    }

    // If it's the default card, set another as default if available
    if (card.isDefault) {
      const nextCard = await CreditCard.findOne({
        userId: req.userId,
        _id: { $ne: cardId }
      });

      if (nextCard) {
        nextCard.isDefault = true;
        await nextCard.save();
      }
    }

    await CreditCard.findByIdAndDelete(cardId);

    // Remove from user's creditCards array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { creditCards: cardId }
    });

    res.json({ message: 'Credit card deleted successfully!' });
  } catch (error) {
    console.error('Delete credit card error:', error);
    res.status(500).json({ message: 'Server error deleting credit card.' });
  }
};

// Set default credit card
const setDefaultCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Remove default from all other cards
    await CreditCard.updateMany(
      { userId: req.userId },
      { $set: { isDefault: false } }
    );

    // Set this card as default
    const card = await CreditCard.findByIdAndUpdate(
      cardId,
      { $set: { isDefault: true } },
      { new: true }
    ).select('-cvv');

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found.' });
    }

    res.json({
      message: 'Default card updated successfully!',
      card
    });
  } catch (error) {
    console.error('Set default card error:', error);
    res.status(500).json({ message: 'Server error setting default card.' });
  }
};

module.exports = {
  addCreditCard,
  getCreditCards,
  getCreditCard,
  updateCreditCard,
  deleteCreditCard,
  setDefaultCard
};
