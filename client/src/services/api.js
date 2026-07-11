import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
}

export const expenseAPI = {
  analyze: (description) => api.post('/expenses/analyze', { description }),
  create: (data) => api.post('/expenses', data),
  list: (params) => api.get('/expenses', { params }),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  exportUrl: (format) => `${API_BASE_URL}/expenses/export?format=${format}`,
}

export const budgetAPI = {
  get: () => api.get('/budget'),
  update: (data) => api.put('/budget', data),
}

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
  getMonthlySummary: () => api.get('/monthly-summary'),
  getAiInsights: () => api.get('/ai-insights'),
}

export const goalAPI = {
  list: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  contribute: (id, amount) => api.put(`/goals/${id}/contribute`, { amount }),
  delete: (id) => api.delete(`/goals/${id}`),
}

export const recurringAPI = {
  list: () => api.get('/recurring'),
  create: (data) => api.post('/recurring', data),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  delete: (id) => api.delete(`/recurring/${id}`),
  process: () => api.post('/recurring/process'),
}

export const receiptAPI = {
  scan: (formData) => api.post('/receipts/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export default api
