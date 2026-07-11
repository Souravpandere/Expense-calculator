import { useEffect, useState } from 'react'
import { recurringAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Medical', 'Entertainment', 'Bills', 'Other']
const FREQUENCIES = ['weekly', 'monthly', 'yearly']

export default function Recurring() {
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: '', amount: '', category: 'Bills', frequency: 'monthly', startDate: new Date().toISOString().slice(0, 10),
  })

  const load = () => {
    setLoading(true)
    recurringAPI.list().then((res) => setRecurring(res.data.recurring)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount) return
    await recurringAPI.create(form)
    setForm({ description: '', amount: '', category: 'Bills', frequency: 'monthly', startDate: new Date().toISOString().slice(0, 10) })
    setShowForm(false)
    load()
  }

  const handleToggleActive = async (item) => {
    await recurringAPI.update(item._id, { active: !item.active })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this recurring expense?')) return
    await recurringAPI.delete(id)
    load()
  }

  if (loading) return <LoadingSpinner fullPage label="Loading recurring expenses..." />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recurring Expenses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ New Recurring Expense'}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">
        Subscriptions and bills here are automatically added to your expenses when they're due.
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="card grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Description</label>
            <input type="text" className="input-field mt-1" placeholder="e.g. Netflix Subscription" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="label">Amount</label>
            <input type="number" className="input-field mt-1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Frequency</label>
            <select className="input-field mt-1" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input-field mt-1" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary sm:col-span-2">Create</button>
        </form>
      )}

      {recurring.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No recurring expenses set up. Add subscriptions or bills to auto-track them monthly.</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700">
          {recurring.map((item) => (
            <div key={item._id} className="py-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{item.description}</p>
                <p className="text-xs text-slate-400">
                  {item.category} • {item.frequency} • Next: {formatDate(item.nextRunDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(item.amount, item.currency)}</span>
                <button onClick={() => handleToggleActive(item)} className={`text-xs px-2 py-1 rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {item.active ? 'Active' : 'Paused'}
                </button>
                <button onClick={() => handleDelete(item._id)} className="text-red-500 text-sm hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
