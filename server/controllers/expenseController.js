const Expense = require('../models/Expense');
const { categorizeExpense } = require('../services/aiService');
const { convertToBaseCurrency } = require('../services/currencyService');
const User = require('../models/User');

// POST /expenses/analyze — AI predicts category before saving (the "Analyze" button)
exports.analyzeExpense = async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required to analyze' });
    }
    const result = await categorizeExpense(description.trim());
    res.json(result); // { category, confidence }
  } catch (err) {
    next(err);
  }
};

// POST /expenses
exports.createExpense = async (req, res, next) => {
  try {
    const { amount, currency, description, category, aiConfidence, paymentMethod, notes, date } = req.body;

    if (!amount || !description || !date) {
      return res.status(400).json({ message: 'Amount, description, and date are required' });
    }

    const user = await User.findById(req.user.id);
    const baseCurrency = user?.baseCurrency || 'INR';
    const expenseCurrency = currency || baseCurrency;

    // If no category was chosen by the user (e.g. they skipped "Analyze"), categorize now.
    let finalCategory = category;
    let finalConfidence = aiConfidence;
    if (!finalCategory) {
      const result = await categorizeExpense(description);
      finalCategory = result.category;
      finalConfidence = result.confidence;
    }

    const amountInBaseCurrency = await convertToBaseCurrency(Number(amount), expenseCurrency, baseCurrency);

    const expense = await Expense.create({
      userId: req.user.id,
      amount: Number(amount),
      currency: expenseCurrency,
      amountInBaseCurrency,
      description,
      category: finalCategory,
      aiConfidence: finalConfidence ?? 0,
      paymentMethod: paymentMethod || 'Other',
      notes: notes || '',
      date,
    });

    res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

// GET /expenses?search=&category=&paymentMethod=&month=&minAmount=&maxAmount=&sortBy=&sortOrder=&page=&limit=
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      paymentMethod,
      month, // format YYYY-MM
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { userId: req.user.id };

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      query.date = { $gte: start, $lt: end };
    }

    if (minAmount || maxAmount) {
      query.amountInBaseCurrency = {};
      if (minAmount) query.amountInBaseCurrency.$gte = Number(minAmount);
      if (maxAmount) query.amountInBaseCurrency.$lte = Number(maxAmount);
    }

    const sortField = ['date', 'amount', 'category', 'description'].includes(sortBy) ? sortBy : 'date';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    const { amount, currency, description, category, paymentMethod, notes, date } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const user = await User.findById(req.user.id);
    const baseCurrency = user?.baseCurrency || 'INR';

    if (amount !== undefined) expense.amount = Number(amount);
    if (currency !== undefined) expense.currency = currency;
    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (notes !== undefined) expense.notes = notes;
    if (date !== undefined) expense.date = date;

    if (amount !== undefined || currency !== undefined) {
      expense.amountInBaseCurrency = await convertToBaseCurrency(expense.amount, expense.currency, baseCurrency);
    }

    await expense.save();
    res.json({ expense });
  } catch (err) {
    next(err);
  }
};

// DELETE /expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /expenses/export?format=csv|excel
exports.exportExpenses = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 }).lean();

    const rows = expenses.map((e) => ({
      Date: new Date(e.date).toISOString().slice(0, 10),
      Description: e.description,
      Category: e.category,
      Amount: e.amount,
      Currency: e.currency,
      'Amount (Base)': e.amountInBaseCurrency,
      'Payment Method': e.paymentMethod,
      Notes: e.notes,
    }));

    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Expenses');

      if (rows.length) {
        sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 20 }));
        sheet.addRows(rows);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const { Parser } = require('json2csv');
      const parser = new Parser({ fields: rows.length ? Object.keys(rows[0]) : [] });
      const csv = parser.parse(rows);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
      res.send(csv);
    }
  } catch (err) {
    next(err);
  }
};
