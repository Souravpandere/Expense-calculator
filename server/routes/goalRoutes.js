const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getGoals,
  createGoal,
  updateGoal,
  contributeToGoal,
  deleteGoal,
} = require('../controllers/goalController');

router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.put('/:id', protect, updateGoal);
router.put('/:id/contribute', protect, contributeToGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;
