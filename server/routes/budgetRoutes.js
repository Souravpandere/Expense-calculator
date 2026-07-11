const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getBudget, updateBudget } = require('../controllers/budgetController');

router.get('/', protect, getBudget);
router.put('/', protect, updateBudget);

module.exports = router;
