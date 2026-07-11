// Static fallback exchange rates (relative to 1 INR). These are approximate
// and meant to keep the app fully functional offline / without an API key.
// For production accuracy, plug in a live provider (e.g. exchangerate-api.com)
// using EXCHANGE_RATE_API_KEY below.
const STATIC_RATES_TO_INR = {
  INR: 1,
  USD: 83.5,
  EUR: 90.5,
  GBP: 105.8,
  JPY: 0.56,
  AUD: 55.2,
  CAD: 61.3,
  SGD: 62.1,
  AED: 22.7,
};

async function getLiveRateToBase(fromCurrency, baseCurrency) {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) throw new Error('No live exchange rate API key configured');

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${baseCurrency}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success') throw new Error('Exchange rate API returned an error');
  return data.conversion_rate;
}

/**
 * Converts an amount from one currency to the user's base currency.
 * Falls back to static approximate rates if no live API key is set
 * or the live call fails.
 */
async function convertToBaseCurrency(amount, fromCurrency, baseCurrency = 'INR') {
  if (fromCurrency === baseCurrency) return amount;

  try {
    const rate = await getLiveRateToBase(fromCurrency, baseCurrency);
    return Math.round(amount * rate * 100) / 100;
  } catch (err) {
    const fromToInr = STATIC_RATES_TO_INR[fromCurrency];
    const baseToInr = STATIC_RATES_TO_INR[baseCurrency];

    if (!fromToInr || !baseToInr) {
      // Unknown currency pair — assume 1:1 rather than failing the request
      return amount;
    }

    const amountInInr = amount * fromToInr;
    const converted = amountInInr / baseToInr;
    return Math.round(converted * 100) / 100;
  }
}

module.exports = { convertToBaseCurrency, STATIC_RATES_TO_INR };
