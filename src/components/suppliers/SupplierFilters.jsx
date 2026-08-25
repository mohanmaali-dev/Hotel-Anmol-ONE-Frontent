import { FiPhone, FiSearch, FiX } from 'react-icons/fi'

import MobileFilterPanel from '../MobileFilterPanel.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function SupplierFilters({ filters, onChange, onClear }) {
  return (
    <MobileFilterPanel filters={filters}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1.5fr_1fr_auto]">
        <label className="relative">
          <span className="sr-only">Search supplier name</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Search supplier name"
            className={`${inputClass} pl-9`}
          />
        </label>
        <label className="relative">
          <span className="sr-only">Search phone</span>
          <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="Search phone"
            className={`${inputClass} pl-9`}
          />
        </label>
        <select
          aria-label="Supplier status"
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
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

export default SupplierFilters
