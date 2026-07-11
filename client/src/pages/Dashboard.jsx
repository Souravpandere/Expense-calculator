import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../services/api'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [insights, setInsights] = useState([])
  const [advice, setAdvice] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.getMonthlySummary(), analyticsAPI.getAiInsights()])
      .then(([summaryRes, insightsRes]) => {
        setSummary(summaryRes.data)
        setInsights(insightsRes.data.insights || [])
        setAdvice(insightsRes.data.advice || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage label="Loading dashboard..." />

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Expenses (This Month)" value={formatCurrency(summary.totalExpenses)} icon="💸" accent="text-red-500" />
        <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} icon="💵" accent="text-green-500" />
        <StatCard label="Remaining Budget" value={formatCurrency(summary.remainingBudget)} icon="🎯" accent={summary.remainingBudget < 0 ? 'text-red-500' : 'text-brand-600'} />
        <StatCard label="Monthly Spending" value={formatCurrency(summary.monthlySpending)} icon="📅" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">🤖 AI Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                <span className="text-brand-500">•</span><span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">💡 Spending Advice</h3>
          <ul className="space-y-2">
            {advice.map((tip, idx) => (
              <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                <span className="text-amber-500">•</span><span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Recent Transactions</h3>
          <Link to="/history" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {summary.recentTransactions?.length ? (
          <div className="space-y-3">
            {summary.recentTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#64748b' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tx.description}</p>
                    <p className="text-xs text-slate-400">{tx.category} • {formatDate(tx.date)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(tx.amountInBaseCurrency)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-3">No transactions yet.</p>
            <Link to="/add-expense" className="btn-primary text-sm">Add Your First Expense</Link>
          </div>
        )}
      </div>
    </div>
  )
}
