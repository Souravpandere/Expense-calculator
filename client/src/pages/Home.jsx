import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
          Track expenses. Get <span className="text-brand-600">AI-powered</span> insights.
        </h1>
        <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Add an expense, let AI categorize it instantly, and see exactly where your money
          goes with budgets, charts, and personalized spending advice.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to={user ? '/dashboard' : '/register'} className="btn-primary text-base px-6 py-3">
            {user ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
          {!user && <Link to="/login" className="btn-secondary text-base px-6 py-3">Login</Link>}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="card">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">AI Categorization</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Type "Uber Ride" and watch it auto-categorize as Travel — instantly.</p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Budget Tracking</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Set category budgets and get alerted before you overspend.</p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Smart Insights</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Understand spending trends and get personalized saving tips.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
