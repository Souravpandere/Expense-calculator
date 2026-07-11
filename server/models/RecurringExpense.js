const mongoose = require('mongoose');

const RecurringExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: 'Other' },
    paymentMethod: { type: String, default: 'Other' },
    frequency: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
    dayOfMonth: { type: Number, default: 1 }, // for monthly/yearly
    nextRunDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecurringExpense', RecurringExpenseSchema);
