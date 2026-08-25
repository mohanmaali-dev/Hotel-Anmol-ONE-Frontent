import { FiSearch, FiX } from 'react-icons/fi'

import DatePickerField from '../DatePickerField.jsx'
import MobileFilterPanel from '../MobileFilterPanel.jsx'
import { expenseCategories } from '../../data/expenseOptions.js'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function ExpenseFilters({ filters, onChange, onClear }) {
  return (
    <MobileFilterPanel filters={filters}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        <label className="relative"><span className="sr-only">Search description</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Search description" className={`${inputClass} pl-9`} /></label>
        <select aria-label="Expense category" value={filters.category} onChange={(event) => onChange('category', event.target.value)} className={inputClass}><option value="">All categories</option>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</select>
        <DatePickerField label="From" value={filters.fromDate} onChange={(value) => onChange('fromDate', value)} />
        <DatePickerField label="To" value={filters.toDate} onChange={(value) => onChange('toDate', value)} />
        <select aria-label="Payment type" value={filters.paymentType} onChange={(event) => onChange('paymentType', event.target.value)} className={inputClass}><option value="">All payment types</option><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option></select>
        <button type="button" onClick={onClear} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiX /> Clear</button>
      </div>
    </MobileFilterPanel>
  )
}

export default ExpenseFilters
