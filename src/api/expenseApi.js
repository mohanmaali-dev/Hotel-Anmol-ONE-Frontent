import api from './axios.js'

export const normalizeExpense = (expense) => ({
  ...expense,
  id: expense?._id || expense?.id,
  addedByName: expense?.addedBy?.name || expense?.addedByName || '',
  addedById: expense?.addedBy?._id || expense?.addedBy || null,
})

const toExpensePayload = (expense) => ({
  date: expense.date,
  category: expense.category,
  amount: Number(expense.amount),
  paymentType: expense.paymentType,
  description: expense.description,
  reference: expense.reference,
  notes: expense.notes,
})

export const getExpenses = async (params = {}) => {
  const response = await api.get('/expenses', { params })
  return { ...response.data, data: (response.data.data || []).map(normalizeExpense) }
}

export const getExpense = async (id) => {
  const response = await api.get(`/expenses/${id}`)
  return { ...response.data, data: normalizeExpense(response.data.data) }
}

export const createExpense = async (expense) => {
  const response = await api.post('/expenses', toExpensePayload(expense))
  return { ...response.data, data: normalizeExpense(response.data.data) }
}

export const updateExpense = async (id, expense) => {
  const response = await api.put(`/expenses/${id}`, toExpensePayload(expense))
  return { ...response.data, data: normalizeExpense(response.data.data) }
}

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`)
  return response.data
}

export const getExpenseSummary = async () => {
  const response = await api.get('/expenses/summary')
  return response.data
}
