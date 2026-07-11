const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');
const { categorizeExpense } = require('./aiService');
const { convertToBaseCurrency } = require('./currencyService');

function computeNextRunDate(current, frequency) {
  const next = new Date(current);
  if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  else if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1); // monthly default
  return next;
}

/**
 * Finds all due recurring expenses for a user (or all users, if no userId
 * given — used by the scheduled job) and materializes them into real
 * Expense documents, then advances nextRunDate.
 */
async function processDueRecurringExpenses(userId = null) {
  const query = { active: true, nextRunDate: { $lte: new Date() } };
  if (userId) query.userId = userId;

  const dueItems = await RecurringExpense.find(query);
  const created = [];

  for (const item of dueItems) {
    const amountInBaseCurrency = await convertToBaseCurrency(item.amount, item.currency, 'INR');

    const expense = await Expense.create({
      userId: item.userId,
      amount: item.amount,
      currency: item.currency,
      amountInBaseCurrency,
      description: item.description,
      category: item.category,
      aiConfidence: 100,
      paymentMethod: item.paymentMethod,
      notes: 'Auto-generated from recurring expense',
      date: item.nextRunDate,
      isRecurringGenerated: true,
      recurringExpenseId: item._id,
    });

    created.push(expense);

    item.nextRunDate = computeNextRunDate(item.nextRunDate, item.frequency);
    await item.save();
  }

  return created;
}

module.exports = { processDueRecurringExpenses, computeNextRunDate };
