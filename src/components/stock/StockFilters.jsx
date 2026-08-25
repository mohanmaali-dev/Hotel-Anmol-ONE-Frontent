import { FiSearch, FiX } from 'react-icons/fi'

import MobileFilterPanel from '../MobileFilterPanel.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function StockFilters({ filters, categories, onChange, onClear }) {
  return (
    <MobileFilterPanel filters={filters}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="relative">
          <span className="sr-only">Search stock item</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search item"
            className={`${inputClass} pl-9`}
          />
        </label>

        <label>
          <span className="sr-only">Category</span>
          <select
            value={filters.category}
            onChange={(event) => onChange('category', event.target.value)}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Stock status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            className={inputClass}
          >
            <option value="">All stock statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
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

export default StockFilters
