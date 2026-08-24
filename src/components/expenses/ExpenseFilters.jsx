import { FiCalendar, FiFilter, FiSearch, FiX } from 'react-icons/fi'

import { expenseCategories } from '../../data/expenseOptions.js'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function ExpenseFilters({ filters, onChange, onClear }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><FiFilter className="text-primary" /> Filters</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <label className="relative"><span className="sr-only">Search description</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Search description" className={`${inputClass} pl-9`} /></label>
        <select aria-label="Expense category" value={filters.category} onChange={(event) => onChange('category', event.target.value)} className={inputClass}><option value="">All categories</option>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</select>
        <label className="relative"><span className="sr-only">From date</span><FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="date" title="From date" value={filters.fromDate} onChange={(event) => onChange('fromDate', event.target.value)} className={`${inputClass} pl-9`} /></label>
        <label className="relative"><span className="sr-only">To date</span><FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="date" title="To date" value={filters.toDate} onChange={(event) => onChange('toDate', event.target.value)} className={`${inputClass} pl-9`} /></label>
        <select aria-label="Payment type" value={filters.paymentType} onChange={(event) => onChange('paymentType', event.target.value)} className={inputClass}><option value="">All payment types</option><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option></select>
        <button type="button" onClick={onClear} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiX /> Clear</button>
      </div>
    </section>
  )
}

export default ExpenseFilters
