const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

const CATEGORY_KEYS = ['food', 'travel', 'shopping', 'entertainment', 'medical', 'bills', 'other'];

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function startOfNextMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

// GET /budget — returns budget limits plus current spend + % used per category
exports.getBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ userId: req.user.id });
    if (!budget) {
      budget = await Budget.create({ userId: req.user.id });
    }

    const monthStart = startOfMonth();
    const monthEnd = startOfNextMonth();

    const spendAgg = await Expense.aggregate([
      { $match: { userId: budget.userId, date: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amountInBaseCurrency' } } },
    ]);

    const spendByCategory = {};
    spendAgg.forEach((row) => {
      spendByCategory[row._id.toLowerCase()] = row.total;
    });

    const breakdown = CATEGORY_KEYS.map((key) => {
      const limit = budget[key] || 0;
      const spent = spendByCategory[key] || 0;
      const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      let alert = null;
      if (limit > 0 && spent >= limit) {
        alert = 'over';
      } else if (limit > 0 && percentUsed >= 90) {
        alert = 'near';
      }
      return {
        category: key.charAt(0).toUpperCase() + key.slice(1),
        limit,
        spent: Math.round(spent * 100) / 100,
        percentUsed,
        alert,
      };
    });

    res.json({ budget, breakdown });
  } catch (err) {
    next(err);
  }
};

// PUT /budget
exports.updateBudget = async (req, res, next) => {
  try {
    const update = {};
    CATEGORY_KEYS.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = Number(req.body[key]);
    });

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json({ budget });
  } catch (err) {
    next(err);
  }
};
