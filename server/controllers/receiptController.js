const fs = require('fs');
const { extractReceiptData } = require('../services/ocrService');
const { categorizeExpense } = require('../services/aiService');

// POST /receipts/scan — upload a receipt image, extract merchant/date/amount via OCR,
// then AI-categorize the merchant name. Returns pre-filled expense fields; does NOT save.
exports.scanReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image uploaded' });
    }

    const filePath = req.file.path;

    let ocrResult;
    try {
      ocrResult = await extractReceiptData(filePath);
    } finally {
      fs.unlink(filePath, () => {});
    }

    let categoryResult = { category: 'Other', confidence: 40 };
    if (ocrResult.merchant) {
      categoryResult = await categorizeExpense(ocrResult.merchant);
    }

    res.json({
      description: ocrResult.merchant || '',
      amount: ocrResult.amount,
      date: ocrResult.date,
      category: categoryResult.category,
      aiConfidence: categoryResult.confidence,
    });
  } catch (err) {
    next(err);
  }
};
