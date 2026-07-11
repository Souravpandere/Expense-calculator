import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    baseCurrency: user?.baseCurrency || 'INR',
    monthlyIncome: user?.monthlyIncome || 0,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await authAPI.updateProfile(form)
    updateUser(res.data.user)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Base Currency</label>
            <select className="input-field mt-1" value={form.baseCurrency} onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">All expenses are converted to this currency for totals and charts.</p>
          </div>
          <div>
            <label className="label">Monthly Income</label>
            <input type="number" className="input-field mt-1" value={form.monthlyIncome} onChange={(e) => setForm({ ...form, monthlyIncome: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
            {saved && <span className="text-green-600 text-sm">✔ Saved</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
