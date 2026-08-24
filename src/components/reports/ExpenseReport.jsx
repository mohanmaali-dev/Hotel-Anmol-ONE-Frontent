import { FiDollarSign } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'
import ReportSummary from './ReportSummary.jsx'

function ExpenseReport({ summary = {}, rows = [] }) {
  const categoryRows = summary.byCategory || []
  return <div className="space-y-5">
    <ReportSummary items={[
      { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses), icon: FiDollarSign },
    ]} />
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Category-wise Expenses</h2><p className="mt-0.5 text-xs text-slate-500">Expense totals by category</p></div><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Total Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{categoryRows.map((item) => <tr key={item.category} className="text-slate-700"><td className="px-5 py-3.5 font-semibold text-slate-900">{item.category}</td><td className="px-5 py-3.5 text-right font-medium">{formatCurrency(item.amount)}</td></tr>)}{!categoryRows.length && <tr><td colSpan="2" className="px-5 py-10 text-center text-slate-500">No expense totals match the selected filters.</td></tr>}</tbody></table></div></section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Expense Details</h2><p className="mt-0.5 text-xs text-slate-500">Expenses matching the selected filters</p></div><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Expense No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Payment</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((expense) => <tr key={expense._id || expense.expenseNo} className="text-slate-700"><td className="px-5 py-3.5">{expense._id ? <Link to={`/expenses/${expense._id}`} className="record-link" title="View expense details">{expense.expenseNo}</Link> : expense.expenseNo}</td><td className="px-4 py-3.5">{formatOrderDate(expense.date)}</td><td className="px-4 py-3.5">{expense.category}</td><td className="max-w-xs truncate px-4 py-3.5">{expense.description}</td><td className="px-4 py-3.5">{expense.paymentType}</td><td className="px-5 py-3.5 text-right font-medium">{formatCurrency(expense.amount)}</td></tr>)}{!rows.length && <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">No expenses match the selected filters.</td></tr>}</tbody></table></div></section>
  </div>
}

export default ExpenseReport
