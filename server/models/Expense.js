const mongoose = require('mongoose');

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Medical', 'Entertainment', 'Bills', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Other'];

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    amountInBaseCurrency: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    aiConfidence: { type: Number, default: 0 }, // 0-100
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'Other' },
    notes: { type: String, default: '' },
    date: { type: Date, required: true, default: Date.now },
    isRecurringGenerated: { type: Boolean, default: false },
    recurringExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringExpense', default: null },
    receiptImage: { type: String, default: null },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
