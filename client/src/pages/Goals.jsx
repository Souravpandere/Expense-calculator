import { useEffect, useState } from 'react'
import { goalAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '' })
  const [contributeAmounts, setContributeAmounts] = useState({})

  const load = () => {
    setLoading(true)
    goalAPI.list().then((res) => setGoals(res.data.goals)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.targetAmount) return
    await goalAPI.create(form)
    setForm({ name: '', targetAmount: '', targetDate: '' })
    setShowForm(false)
    load()
  }

  const handleContribute = async (id) => {
    const amount = Number(contributeAmounts[id])
    if (!amount || amount <= 0) return
    await goalAPI.contribute(id, amount)
    setContributeAmounts({ ...contributeAmounts, [id]: '' })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return
    await goalAPI.delete(id)
    load()
  }

  if (loading) return <LoadingSpinner fullPage label="Loading goals..." />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Savings Goals</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label">Goal Name</label>
            <input type="text" className="input-field mt-1" placeholder="e.g. Laptop" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Target Amount</label>
            <input type="number" className="input-field mt-1" placeholder="80000" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Target Date (optional)</label>
            <input type="date" className="input-field mt-1" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary sm:col-span-3">Create Goal</button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No savings goals yet. Create one to start tracking progress toward something you want.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            return (
              <div key={goal._id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{goal.name}</h3>
                    {goal.targetDate && <p className="text-xs text-slate-400">Target: {formatDate(goal.targetDate)}</p>}
                  </div>
                  <button onClick={() => handleDelete(goal._id)} className="text-red-500 text-sm hover:underline">Delete</button>
                </div>

                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500 dark:text-slate-400">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${goal.completed ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                </div>

                {goal.completed ? (
                  <p className="text-sm text-green-600 font-medium">🎉 Goal reached!</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number" placeholder="Add amount" className="input-field text-sm"
                      value={contributeAmounts[goal._id] || ''}
                      onChange={(e) => setContributeAmounts({ ...contributeAmounts, [goal._id]: e.target.value })}
                    />
                    <button onClick={() => handleContribute(goal._id)} className="btn-secondary text-sm whitespace-nowrap">Add</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
