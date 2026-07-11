const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    food: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    bills: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', BudgetSchema);
