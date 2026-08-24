import { FiEye, FiFileText } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

function ExpenseTable({ expenses, total = expenses.length, loading = false }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">All Expenses</h2><p className="mt-0.5 text-xs text-slate-500">{total} {total === 1 ? 'expense' : 'expenses'} found</p></div>
      {loading ? <div className="grid place-items-center px-6 py-16"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading expenses...</p></div> : expenses.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead><tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Expense No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Payment Type</th><th className="px-4 py-3">Added By</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4"><Link to={`/expenses/${expense.id}`} className="record-link" title="View expense details">#{expense.expenseNo}</Link></td>
                  <td className="whitespace-nowrap px-4 py-4">{formatOrderDate(expense.date)}</td>
                  <td className="whitespace-nowrap px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{expense.category}</span></td>
                  <td className="max-w-xs truncate px-4 py-4 font-medium text-slate-700">{expense.description}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-800">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-4">{expense.paymentType}</td>
                  <td className="whitespace-nowrap px-4 py-4">{expense.addedByName || 'Not available'}</td>
                  <td className="px-5 py-4 text-center"><Link to={`/expenses/${expense.id}`} aria-label={`View ${expense.expenseNo}`} title="View expense" className="inline-grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary/30 hover:bg-primary-light hover:text-primary-dark"><FiEye /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-16 text-center"><FiFileText className="text-2xl text-slate-400" /><p className="mt-3 font-semibold text-slate-700">No expenses found</p><p className="mt-1 text-sm text-slate-500">Try changing or clearing the filters.</p></div>
      )}
    </section>
  )
}

export default ExpenseTable
