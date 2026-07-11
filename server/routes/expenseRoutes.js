const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  analyzeExpense,
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  exportExpenses,
} = require('../controllers/expenseController');

router.post('/analyze', protect, analyzeExpense);
router.get('/export', protect, exportExpenses);
router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
