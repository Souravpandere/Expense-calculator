import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { analyticsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, CATEGORY_COLORS } from '../utils/format'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getAnalytics().then((res) => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner fullPage label="Loading analytics..." />

  const hasData = data.pieChart?.length > 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Monthly Analytics</h1>

      {!hasData ? (
        <div className="card text-center py-16">
          <p className="text-slate-400">No expenses recorded this month yet — add some to see your analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.pieChart} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(entry) => entry.category}>
                    {data.pieChart.map((entry, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[entry.category] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Category Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.barChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" fontSize={12} stroke="#94a3b8" />
                  <YAxis fontSize={12} stroke="#94a3b8" />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {data.barChart.map((entry, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[entry.category] || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Daily Spending Trend (This Month)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.lineChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
