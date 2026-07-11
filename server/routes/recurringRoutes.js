const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  processRecurring,
} = require('../controllers/recurringController');

router.get('/', protect, getRecurring);
router.post('/', protect, createRecurring);
router.put('/:id', protect, updateRecurring);
router.delete('/:id', protect, deleteRecurring);
router.post('/process', protect, processRecurring);

module.exports = router;
