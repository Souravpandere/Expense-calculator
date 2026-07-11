import { useEffect, useState } from 'react'
import { budgetAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency } from '../utils/format'

const CATEGORY_KEYS = ['food', 'travel', 'shopping', 'entertainment', 'medical', 'bills', 'other']

export default function Budget() {
  const [breakdown, setBreakdown] = useState([])
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = () => {
    setLoading(true)
    budgetAPI.get().then((res) => {
      setBreakdown(res.data.breakdown)
      const initial = {}
      CATEGORY_KEYS.forEach((key) => { initial[key] = res.data.budget[key] || 0 })
      setForm(initial)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleChange = (key, value) => setForm({ ...form, [key]: value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await budgetAPI.update(form)
    setSaved(true)
    load()
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <LoadingSpinner fullPage label="Loading budget..." />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Budget Management</h1>

      <div className="card">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">This Month's Progress</h3>
        <div className="space-y-4">
          {breakdown.map((item) => (
            <div key={item.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.category}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {formatCurrency(item.spent)}/{formatCurrency(item.limit)} · {item.percentUsed}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.alert === 'over' ? 'bg-red-500' : item.alert === 'near' ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                />
              </div>
              {item.alert === 'over' && (
                <p className="text-xs text-red-500 mt-1">⚠ You've exceeded your {item.category} budget!</p>
              )}
              {item.alert === 'near' && (
                <p className="text-xs text-amber-500 mt-1">⚠ Approaching your {item.category} budget limit.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Set Monthly Budget Limits</h3>
        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
          {CATEGORY_KEYS.map((key) => (
            <div key={key}>
              <label className="label capitalize">{key}</label>
              <input
                type="number" min="0" className="input-field mt-1"
                value={form[key] ?? 0}
                onChange={(e) => handleChange(key, Number(e.target.value))}
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Budget'}</button>
            {saved && <span className="text-green-600 text-sm">✔ Budget updated</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
