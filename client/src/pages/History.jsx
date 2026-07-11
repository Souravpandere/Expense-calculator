import { useEffect, useState } from 'react'
import { expenseAPI } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'
import EditExpenseModal from '../components/EditExpenseModal'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Medical', 'Entertainment', 'Bills', 'Other']
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Other']

export default function History() {
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [month, setMonth] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 400)

  const loadExpenses = () => {
    setLoading(true)
    expenseAPI
      .list({
        search: debouncedSearch || undefined,
        category: category || undefined,
        paymentMethod: paymentMethod || undefined,
        month: month || undefined,
        minAmount: minAmount || undefined,
        maxAmount: maxAmount || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      })
      .then((res) => {
        setExpenses(res.data.expenses)
        setPagination(res.data.pagination)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, paymentMethod, month, minAmount, maxAmount, sortBy, sortOrder, page])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return
    await expenseAPI.delete(id)
    loadExpenses()
  }

  const handleSaveEdit = async (id, data) => {
    await expenseAPI.update(id, data)
    setEditingExpense(null)
    loadExpenses()
  }

  const handleExport = (format) => {
    const token = localStorage.getItem('token')
    const url = `${expenseAPI.exportUrl(format)}`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = format === 'excel' ? 'expenses.xlsx' : 'expenses.csv'
        link.click()
      })
  }

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-xs">{sortBy === field ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Expense History</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary text-sm">⬇ CSV</button>
          <button onClick={() => handleExport('excel')} className="btn-secondary text-sm">⬇ Excel</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text" placeholder="Search description..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input-field lg:col-span-2"
          />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="input-field">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setPage(1) }} className="input-field">
            <option value="">All Payment Methods</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1) }} className="input-field" />
          <div className="flex gap-2">
            <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1) }} className="input-field" />
            <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1) }} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <LoadingSpinner label="Loading expenses..." />
        ) : expenses.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No expenses found matching your filters.</p>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleSort('date')}>Date<SortIcon field="date" /></th>
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleSort('description')}>Description<SortIcon field="description" /></th>
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleSort('category')}>Category<SortIcon field="category" /></th>
                  <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleSort('amount')}>Amount<SortIcon field="amount" /></th>
                  <th className="py-2 pr-4">Payment Method</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatDate(exp.date)}</td>
                    <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{exp.description}</td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `${CATEGORY_COLORS[exp.category]}20`, color: CATEGORY_COLORS[exp.category] }}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(exp.amountInBaseCurrency)}</td>
                    <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{exp.paymentMethod}</td>
                    <td className="py-3 pr-4 flex gap-3">
                      <button onClick={() => setEditingExpense(exp)} className="text-brand-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(exp._id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            <p className="text-xs text-slate-400 mt-2 text-center">{pagination.total} total expense(s)</p>
          </>
        )}
      </div>

      {editingExpense && (
        <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSave={handleSaveEdit} />
      )}
    </div>
  )
}
