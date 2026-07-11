import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/add-expense', label: 'Add Expense', icon: '➕' },
  { to: '/history', label: 'History', icon: '📜' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/budget', label: 'Budget', icon: '🎯' },
  { to: '/goals', label: 'Savings Goals', icon: '🏆' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="md:w-60 w-full bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex md:flex-col">
        <div className="p-4 font-bold text-brand-600 text-lg hidden md:block">
          💰 Expense<span className="text-slate-800 dark:text-slate-100">AI</span>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible flex-1 md:p-2 gap-1 px-2 md:px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 sm:px-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
