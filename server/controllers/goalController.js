const SavingsGoal = require('../models/SavingsGoal');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (err) {
    next(err);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Name and target amount are required' });
    }
    const goal = await SavingsGoal.create({
      userId: req.user.id,
      name,
      targetAmount: Number(targetAmount),
      targetDate: targetDate || null,
    });
    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (targetDate !== undefined) goal.targetDate = targetDate;

    await goal.save();
    res.json({ goal });
  } catch (err) {
    next(err);
  }
};

// PUT /goals/:id/contribute — add money toward a goal
exports.contributeToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A positive contribution amount is required' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.completed = true;
    }
    await goal.save();
    res.json({ goal });
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};
