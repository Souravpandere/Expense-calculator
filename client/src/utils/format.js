export function formatCurrency(amount, currency = 'INR') {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }
  const symbol = symbols[currency] || currency + ' '
  const num = Number(amount) || 0
  return `${symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const CATEGORY_COLORS = {
  Food: '#f97316',
  Travel: '#3b82f6',
  Shopping: '#a855f7',
  Medical: '#ef4444',
  Entertainment: '#ec4899',
  Bills: '#14b8a6',
  Other: '#64748b',
}
