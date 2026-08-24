import { useEffect, useState } from 'react'
import { FiArrowLeft, FiFileText } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { createExpense, getExpense, updateExpense } from '../../api/expenseApi.js'
import ExpenseForm from '../../components/expenses/ExpenseForm.jsx'

function NewExpense() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [initialExpense, setInitialExpense] = useState(null)
  const [loading, setLoading] = useState(Boolean(editId))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editId) return
    let active = true
    getExpense(editId).then((result) => active && setInitialExpense(result.data)).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [editId])

  const handleSave = async (expense) => {
    if (submitting) return
    setSubmitting(true); setError('')
    try {
      const result = editId ? await updateExpense(editId, expense) : await createExpense(expense)
      navigate(`/expenses/${result.data.id}`, { state: { message: result.message } })
    } catch (requestError) { setError(requestError.message) }
    finally { setSubmitting(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading expense...</p></div></main>
  if (editId && !initialExpense) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiFileText className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">Expense not found</h2><p className="mt-2 text-sm text-rose-600">{error}</p><Link to="/expenses" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Expenses</Link></div></main>

  return <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content"><div className="mb-6"><Link to={initialExpense ? `/expenses/${initialExpense.id}` : '/expenses'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Expenses</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{initialExpense ? 'Edit Expense' : 'Add Expense'}</h2><p className="mt-1 text-sm text-slate-500">Record a restaurant operating expense.</p></div><ExpenseForm initialExpense={initialExpense} onSave={handleSave} submitting={submitting} apiError={error} onClearError={() => setError('')} /></div></main>
}

export default NewExpense
