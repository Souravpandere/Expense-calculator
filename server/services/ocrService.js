const Tesseract = require('tesseract.js');

const AMOUNT_REGEX = /(?:total|amount|grand total|net payable)?\s*[:\-]?\s*(?:₹|rs\.?|inr|\$)\s*([\d,]+\.?\d{0,2})/gi;
const DATE_REGEX = /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/;

/**
 * Extracts merchant name, date, and amount from a receipt image using OCR.
 * This is a heuristic parser on top of raw OCR text — receipt layouts vary
 * a lot, so results should be treated as a helpful pre-fill, not ground truth.
 */
async function extractReceiptData(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'eng');
  const text = data.text || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Merchant name: usually one of the first non-empty lines
  const merchant = lines.slice(0, 3).find((l) => l.length > 2 && !/^\d+$/.test(l)) || '';

  // Amount: find all currency-like matches, take the largest (usually the total)
  const amounts = [];
  let match;
  while ((match = AMOUNT_REGEX.exec(text)) !== null) {
    const num = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(num)) amounts.push(num);
  }
  const amount = amounts.length ? Math.max(...amounts) : null;

  // Date
  const dateMatch = text.match(DATE_REGEX);
  const date = dateMatch ? dateMatch[1] : null;

  return {
    merchant: merchant.slice(0, 100),
    amount,
    date,
    rawText: text.slice(0, 2000),
  };
}

module.exports = { extractReceiptData };
