const RecurringExpense = require('../models/RecurringExpense');
const { processDueRecurringExpenses } = require('../services/recurringService');

exports.getRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.find({ userId: req.user.id }).sort({ nextRunDate: 1 });
    res.json({ recurring });
  } catch (err) {
    next(err);
  }
};

exports.createRecurring = async (req, res, next) => {
  try {
    const { amount, currency, description, category, paymentMethod, frequency, dayOfMonth, startDate } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ message: 'Amount and description are required' });
    }

    const nextRunDate = startDate ? new Date(startDate) : new Date();

    const recurring = await RecurringExpense.create({
      userId: req.user.id,
      amount: Number(amount),
      currency: currency || 'INR',
      description,
      category: category || 'Other',
      paymentMethod: paymentMethod || 'Other',
      frequency: frequency || 'monthly',
      dayOfMonth: dayOfMonth || 1,
      nextRunDate,
    });

    res.status(201).json({ recurring });
  } catch (err) {
    next(err);
  }
};

exports.updateRecurring = async (req, res, next) => {
  try {
    const { amount, description, category, paymentMethod, frequency, active } = req.body;
    const recurring = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!recurring) return res.status(404).json({ message: 'Recurring expense not found' });

    if (amount !== undefined) recurring.amount = Number(amount);
    if (description !== undefined) recurring.description = description;
    if (category !== undefined) recurring.category = category;
    if (paymentMethod !== undefined) recurring.paymentMethod = paymentMethod;
    if (frequency !== undefined) recurring.frequency = frequency;
    if (active !== undefined) recurring.active = active;

    await recurring.save();
    res.json({ recurring });
  } catch (err) {
    next(err);
  }
};

exports.deleteRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!recurring) return res.status(404).json({ message: 'Recurring expense not found' });
    res.json({ message: 'Recurring expense deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /recurring/process — manually trigger processing of due items
// (also run automatically on a schedule — see server.js)
exports.processRecurring = async (req, res, next) => {
  try {
    const created = await processDueRecurringExpenses(req.user.id);
    res.json({ message: `${created.length} recurring expense(s) processed`, created });
  } catch (err) {
    next(err);
  }
};
