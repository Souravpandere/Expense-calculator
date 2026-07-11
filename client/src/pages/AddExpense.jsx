import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { expenseAPI, receiptAPI } from '../services/api'
import { CATEGORY_COLORS } from '../utils/format'

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Other']
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED']

export default function AddExpense() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    amount: '',
    currency: 'INR',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI',
    notes: '',
  })
  const [category, setCategory] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'description') {
      setCategory(null)
      setConfidence(null)
    }
  }

  const handleAnalyze = async () => {
    if (!form.description.trim()) {
      setError('Enter a description first, then click Analyze.')
      return
    }
    setError('')
    setAnalyzing(true)
    try {
      const res = await expenseAPI.analyze(form.description)
      setCategory(res.data.category)
      setConfidence(res.data.confidence)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not analyze description.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setScanning(true)
    const formData = new FormData()
    formData.append('receipt', file)
    try {
      const res = await receiptAPI.scan(formData)
      setForm((prev) => ({
        ...prev,
        description: res.data.description || prev.description,
        amount: res.data.amount ?? prev.amount,
      }))
      if (res.data.category) {
        setCategory(res.data.category)
        setConfidence(res.data.aiConfidence)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not read the receipt. Please enter details manually.')
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.description || !form.date) {
      setError('Amount, description, and date are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await expenseAPI.create({
        ...form,
        amount: Number(form.amount),
        category: category || undefined,
        aiConfidence: confidence || undefined,
      })
      navigate('/history')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Expense</h1>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Or scan a receipt to auto-fill:</p>
          <label className="btn-secondary text-sm cursor-pointer">
            {scanning ? 'Scanning...' : '📷 Upload Receipt'}
            <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} disabled={scanning} />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount</label>
              <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} className="input-field mt-1" placeholder="0.00" required />
            </div>
            <div>
              <label className="label">Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="input-field mt-1">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} className="input-field mt-1" placeholder="e.g. Uber Ride, Pizza Hut, Netflix Subscription" required />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={handleAnalyze} disabled={analyzing} className="btn-secondary text-sm">
              {analyzing ? 'Analyzing...' : '🤖 Analyze'}
            </button>
            {category && (
              <span
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: `${CATEGORY_COLORS[category]}20`, color: CATEGORY_COLORS[category] }}
              >
                {category} {confidence ? `(${confidence}% confidence)` : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field mt-1" required />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="input-field mt-1">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field mt-1" rows={3} placeholder="Any additional details..." />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
