import { useState } from 'react'
import { FiChevronDown, FiDownload, FiPrinter, FiRefreshCw, FiSearch } from 'react-icons/fi'

import DatePickerField from '../DatePickerField.jsx'
import MobileFilterPanel from '../MobileFilterPanel.jsx'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

const filterOptions = {
  sales: ['paymentType', 'orderType', 'paymentStatus'],
  purchases: ['paymentType', 'paymentStatus', 'purchaseStatus', 'supplier'],
  expenses: ['paymentType', 'category'],
  stock: ['stockStatus', 'category'],
  payments: ['paymentType', 'paymentStatus'],
  orders: ['orderType', 'paymentType', 'paymentStatus', 'orderStatus'],
}

function SelectField({ label, value, onChange, children }) {
  return <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><select value={value} onChange={onChange} className={inputClass}>{children}</select></label>
}

function ReportFilters({ activeReport, filters, onChange, onApply, onReset, onExport, onPrint }) {
  const [showMore, setShowMore] = useState(false)
  const visibleFilters = filterOptions[activeReport] || []

  return (
    <MobileFilterPanel filters={filters} title="Report Filters" className="p-3 print:hidden">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="shrink-0 pb-1 xl:w-24"><h2 className="text-sm font-bold text-slate-800">2. Date</h2><p className="text-xs text-slate-400">Optional</p></div>

        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:max-w-xl">
          <DatePickerField label="From" value={filters.fromDate} onChange={(value) => onChange('fromDate', value)} />
          <DatePickerField label="To" value={filters.toDate} onChange={(value) => onChange('toDate', value)} />
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
          {visibleFilters.length > 0 && (
            <button type="button" onClick={() => setShowMore((current) => !current)} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <FiChevronDown className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
              {showMore ? 'Less' : 'More Filters'}
            </button>
          )}
          <button type="button" onClick={onReset} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiRefreshCw /> Clear</button>
          <button type="button" onClick={onApply} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiSearch /> View</button>
          <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <button type="button" onClick={onPrint} title="Print report" aria-label="Print report" className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><FiPrinter /></button>
          <button type="button" onClick={onExport} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"><FiDownload className="text-base" /> Download Report</button>
        </div>
      </div>

      {showMore && (
        <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleFilters.includes('paymentType') && <SelectField label="Payment Type" value={filters.paymentType} onChange={(event) => onChange('paymentType', event.target.value)}><option value="">All payment types</option><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option></SelectField>}
          {visibleFilters.includes('orderType') && <SelectField label="Order Type" value={filters.orderType} onChange={(event) => onChange('orderType', event.target.value)}><option value="">All order types</option><option value="Dine In">Dine In</option><option value="Parcel">Parcel</option><option value="Room">Room</option></SelectField>}
          {visibleFilters.includes('paymentStatus') && <SelectField label="Payment Status" value={filters.paymentStatus} onChange={(event) => onChange('paymentStatus', event.target.value)}><option value="">All payment statuses</option><option value="Paid">Paid</option><option value="Partial">Partial</option><option value="Not Paid">Not Paid</option></SelectField>}
          {visibleFilters.includes('purchaseStatus') && <SelectField label="Purchase Status" value={filters.status} onChange={(event) => onChange('status', event.target.value)}><option value="">All purchase statuses</option><option value="Draft">Draft</option><option value="Ordered">Ordered</option><option value="Received">Received</option><option value="Cancelled">Cancelled</option></SelectField>}
          {visibleFilters.includes('stockStatus') && <SelectField label="Stock Status" value={filters.status} onChange={(event) => onChange('status', event.target.value)}><option value="">All stock statuses</option><option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Out of Stock">Out of Stock</option></SelectField>}
          {visibleFilters.includes('orderStatus') && <SelectField label="Order Status" value={filters.status} onChange={(event) => onChange('status', event.target.value)}><option value="">All order statuses</option><option value="Pending">Pending</option><option value="Preparing">Preparing</option><option value="Ready">Ready</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></SelectField>}
          {visibleFilters.includes('supplier') && <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">Supplier</span><input type="text" value={filters.supplier} onChange={(event) => onChange('supplier', event.target.value)} placeholder="Enter supplier" className={inputClass} /></label>}
          {visibleFilters.includes('category') && <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">Category</span><input type="text" value={filters.category} onChange={(event) => onChange('category', event.target.value)} placeholder="Enter category" className={inputClass} /></label>}
        </div>
      )}

    </MobileFilterPanel>
  )
}

export default ReportFilters
