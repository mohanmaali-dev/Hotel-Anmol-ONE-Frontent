import { FiSearch, FiX } from 'react-icons/fi'

import DatePickerField from '../DatePickerField.jsx'
import MobileFilterPanel from '../MobileFilterPanel.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function PurchaseFilters({ filters, suppliers, onChange, onClear }) {
  return (
    <MobileFilterPanel filters={filters}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_repeat(5,1fr)_auto]">
        <label className="relative">
          <span className="sr-only">Search purchase or supplier</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Purchase No. or supplier"
            className={`${inputClass} pl-9`}
          />
        </label>

        <label>
          <span className="sr-only">Supplier</span>
          <select value={filters.supplier} onChange={(event) => onChange('supplier', event.target.value)} className={inputClass}>
            <option value="">All suppliers</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
        </label>

        <DatePickerField label="From" value={filters.fromDate} onChange={(value) => onChange('fromDate', value)} />

        <DatePickerField label="To" value={filters.toDate} onChange={(value) => onChange('toDate', value)} />

        <label>
          <span className="sr-only">Payment status</span>
          <select
            value={filters.paymentStatus}
            onChange={(event) => onChange('paymentStatus', event.target.value)}
            className={inputClass}
          >
            <option value="">All payment statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Not Paid">Not Paid</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Purchase status</span>
          <select
            value={filters.purchaseStatus}
            onChange={(event) => onChange('purchaseStatus', event.target.value)}
            className={inputClass}
          >
            <option value="">All purchase statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onClear}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FiX /> Clear
        </button>
      </div>
    </MobileFilterPanel>
  )
}

export default PurchaseFilters
