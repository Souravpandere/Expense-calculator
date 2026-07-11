require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { processDueRecurringExpenses } = require('./services/recurringService');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const receiptRoutes = require('./routes/receiptRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Expense AI API is running' });
});

app.use('/api', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api', analyticsRoutes); // /api/analytics, /api/monthly-summary, /api/ai-insights
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/receipts', receiptRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Run once on startup, then every day at 1am — materializes any due
  // recurring expenses (subscriptions, bills) into real Expense entries.
  processDueRecurringExpenses().catch((err) => console.error('Recurring processing error:', err.message));

  cron.schedule('0 1 * * *', () => {
    processDueRecurringExpenses().catch((err) => console.error('Recurring processing error:', err.message));
  });
});
