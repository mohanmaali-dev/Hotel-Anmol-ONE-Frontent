import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

function Pagination({ pagination, onPageChange, label }) {
  if (!pagination || pagination.pages <= 1) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
        <span className="font-semibold text-slate-800">{pagination.pages}</span> · {pagination.total}{' '}
        {label}
      </p>
      <div className="flex gap-2">
        <button type="button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft /> Previous</button>
        <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next <FiChevronRight /></button>
      </div>
    </div>
  )
}

export default Pagination
