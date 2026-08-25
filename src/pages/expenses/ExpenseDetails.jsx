import { useEffect, useState } from 'react'
import { FiArrowLeft, FiEdit2, FiFileText, FiTrash2 } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { deleteExpense, getExpense } from '../../api/expenseApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import DangerZone from '../../components/DangerZone.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

function DetailItem({ label, value, valueClass = 'text-slate-800' }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1.5 text-sm font-semibold ${valueClass}`}>{value || '—'}</p></div>
}

function ExpenseDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, can } = useAuth()
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  useEffect(() => {
    let active = true
    getExpense(id).then((result) => active && setExpense(result.data)).catch((requestError) => active && setNotice({ type: 'error', text: requestError.message })).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try { const result = await deleteExpense(expense.id); navigate('/expenses', { state: { message: result.message } }) }
    catch (requestError) { setNotice({ type: 'error', text: requestError.message }); setDeleting(false); setConfirmDelete(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading expense...</p></div></main>
  if (!expense) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiFileText className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">Expense not found</h2><p className="mt-2 text-sm text-rose-600">{notice?.text}</p><Link to="/expenses" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Expenses</Link></div></main>

  const addedBy = expense.addedByName || (String(expense.addedById) === String(user?._id) ? user?.name : 'Not available')
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link to="/expenses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Expenses</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">#{expense.expenseNo}</h2><p className="mt-1 text-sm text-slate-500">Expense details and payment information.</p></div><div className="flex flex-wrap gap-2">{can('expenses', 'edit') && <Link to={`/expenses/new?edit=${expense.id}`} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiEdit2 /> Edit Expense</Link>}</div></div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiFileText /></span><h3 className="font-bold text-slate-900">Expense Information</h3></div><div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4"><DetailItem label="Expense No." value={`#${expense.expenseNo}`} /><DetailItem label="Date" value={formatOrderDate(expense.date)} /><DetailItem label="Category" value={expense.category} /><DetailItem label="Amount" value={formatCurrency(expense.amount)} valueClass="text-primary-dark" /><DetailItem label="Payment Type" value={expense.paymentType} /><DetailItem label="Reference / Bill No." value={expense.reference} /><DetailItem label="Added By" value={addedBy} /><div className="col-span-2 sm:col-span-3 lg:col-span-4"><DetailItem label="Description" value={expense.description} /></div><div className="col-span-2 sm:col-span-3 lg:col-span-4"><DetailItem label="Notes" value={expense.notes} /></div></div></section>
      {can('expenses', 'delete') && <DangerZone title="Delete this expense" description="Permanently remove this expense from expense records and future reports. This action cannot be undone."><button type="button" onClick={() => setConfirmDelete(true)} className="flex h-9 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"><FiTrash2 /> Delete Expense</button></DangerZone>}
      <ConfirmDeleteModal open={confirmDelete} title={`Delete expense ${expense.expenseNo}?`} message="This expense will be permanently removed from expense records and future reports. This action cannot be undone." dependencyType="expense" recordId={expense.id} confirmLabel="Delete Expense" loading={deleting} onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
    </div></main>
  )
}

export default ExpenseDetails
