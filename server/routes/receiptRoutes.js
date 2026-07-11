const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const upload = require('../utils/multerConfig');
const { scanReceipt } = require('../controllers/receiptController');

router.post('/scan', protect, upload.single('receipt'), scanReceipt);

module.exports = router;
