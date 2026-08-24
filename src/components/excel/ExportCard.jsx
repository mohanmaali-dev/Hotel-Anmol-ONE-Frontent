import { useState } from 'react'
import { FiDownload, FiFileText } from 'react-icons/fi'

const inputClass = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function ExportCard({ type, onExport, loading = false }) {
  const [dates, setDates] = useState({ fromDate: '', toDate: '' })
  const [error, setError] = useState('')

  const handleExport = async () => {
    if (dates.fromDate && dates.toDate && dates.fromDate > dates.toDate) {
      setError('From Date cannot be later than To Date.')
      return
    }
    setError('')
    try { await onExport(type, dates) } catch (requestError) { setError(requestError.message) }
  }

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FiFileText /></span><div><h2 className="font-bold text-slate-900">{type.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{type.description}</p></div></div>
      {type.usesDates ? <div className="mt-4 grid grid-cols-2 gap-3"><label><span className="mb-1 block text-xs font-semibold text-slate-600">From Date</span><input type="date" value={dates.fromDate} onChange={(event) => setDates((current) => ({ ...current, fromDate: event.target.value }))} className={inputClass} /></label><label><span className="mb-1 block text-xs font-semibold text-slate-600">To Date</span><input type="date" value={dates.toDate} onChange={(event) => setDates((current) => ({ ...current, toDate: event.target.value }))} className={inputClass} /></label></div> : <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">Downloads the latest information.</div>}
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
      <button type="button" disabled={loading} onClick={handleExport} className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><FiDownload /> {loading ? 'Preparing...' : 'Export Excel'}</button>
    </article>
  )
}

export default ExportCard
