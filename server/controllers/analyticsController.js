const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { generateInsights, generateAdvice } = require('../services/aiService');

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function startOfNextMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}
function startOfLastMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

// GET /analytics — pie (by category), bar (by category), line (daily spend this month)
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const monthStart = startOfMonth();
    const monthEnd = startOfNextMonth();

    const byCategory = await Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amountInBaseCurrency' } } },
      { $sort: { total: -1 } },
    ]);

    const byDay = await Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lt: monthEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amountInBaseCurrency' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      pieChart: byCategory.map((c) => ({ category: c._id, total: Math.round(c.total * 100) / 100 })),
      barChart: byCategory.map((c) => ({ category: c._id, total: Math.round(c.total * 100) / 100 })),
      lineChart: byDay.map((d) => ({ date: d._id, total: Math.round(d.total * 100) / 100 })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /monthly-summary — dashboard stat cards
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const monthStart = startOfMonth();
    const monthEnd = startOfNextMonth();

    const [currentMonthAgg] = await Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amountInBaseCurrency' } } },
    ]);

    const totalExpenses = currentMonthAgg?.total || 0;

    const budget = await Budget.findOne({ userId: req.user.id });
    const totalBudget = budget
      ? ['food', 'travel', 'shopping', 'entertainment', 'medical', 'bills', 'other'].reduce(
          (sum, key) => sum + (budget[key] || 0),
          0
        )
      : 0;

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const income = user?.monthlyIncome || 0;

    const recentTransactions = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome: income,
      remainingBudget: Math.round((totalBudget - totalExpenses) * 100) / 100,
      totalBudget,
      monthlySpending: Math.round(totalExpenses * 100) / 100,
      recentTransactions,
    });
  } catch (err) {
    next(err);
  }
};

// GET /ai-insights — insights + spending advice comparing this month vs last month
exports.getAiInsights = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const currentStart = startOfMonth();
    const currentEnd = startOfNextMonth();
    const lastStart = startOfLastMonth();
    const lastEnd = currentStart;

    const [currentAgg, lastAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: currentStart, $lt: currentEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amountInBaseCurrency' } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: lastStart, $lt: lastEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amountInBaseCurrency' } } },
      ]),
    ]);

    const currentMonthByCategory = {};
    currentAgg.forEach((c) => { currentMonthByCategory[c._id] = c.total; });
    const lastMonthByCategory = {};
    lastAgg.forEach((c) => { lastMonthByCategory[c._id] = c.total; });

    const currentTotal = Object.values(currentMonthByCategory).reduce((a, b) => a + b, 0);
    const lastTotal = Object.values(lastMonthByCategory).reduce((a, b) => a + b, 0);

    const budget = await Budget.findOne({ userId: req.user.id });

    const insights = generateInsights({ currentMonthByCategory, lastMonthByCategory, currentTotal, lastTotal });
    const advice = generateAdvice({ currentMonthByCategory, lastMonthByCategory, budgets: budget?.toObject() });

    res.json({ insights, advice });
  } catch (err) {
    next(err);
  }
};
