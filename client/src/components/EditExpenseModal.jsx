import { useState } from 'react'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Medical', 'Entertainment', 'Bills', 'Other']
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Other']

export default function EditExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    notes: expense.notes || '',
    date: new Date(expense.date).toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(expense._id, { ...form, amount: Number(form.amount) })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Edit Expense</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount</label>
            <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} className="input-field mt-1" required />
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" name="description" value={form.description} onChange={handleChange} className="input-field mt-1" required />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field mt-1">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
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
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field mt-1" rows={2} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
