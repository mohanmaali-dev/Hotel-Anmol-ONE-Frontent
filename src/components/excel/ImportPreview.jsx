import { FiAlertCircle, FiCheckCircle, FiEye } from 'react-icons/fi'

function ImportPreview({ preview, confirmed, onConfirmChange }) {
  const ready = preview.validRows.length > 0
  const invalidRows = new Set(preview.errors.map((error) => error.row)).size
  return <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
    <div className="flex items-start gap-2 border-b border-slate-200 bg-white px-3.5 py-3"><FiEye className="mt-0.5 shrink-0 text-primary" /><div><p className="text-sm font-semibold text-slate-800">File Preview</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{preview.note} {preview.validRows.length} ready to import{invalidRows ? `, ${invalidRows} need attention` : ''}.</p></div></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-slate-100 text-slate-600"><tr>{preview.columns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-2.5 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{preview.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`} className="max-w-48 truncate px-3 py-2.5 text-slate-600">{value || '—'}</td>)}</tr>)}{!preview.rows.length && <tr><td colSpan={preview.columns.length} className="px-3 py-6 text-center text-slate-500">No data rows found.</td></tr>}</tbody></table></div>
    {preview.errors.length > 0 && <div className="max-h-36 overflow-y-auto border-t border-rose-100 bg-rose-50 px-3.5 py-3 text-xs text-rose-700"><p className="mb-1.5 font-semibold">Rows that need attention ({invalidRows})</p>{preview.errors.map((error, index) => <p key={`${error.row}-${index}`}>Row {error.row}: {error.message}</p>)}</div>}
    <label className={`flex items-start gap-3 border-t px-3.5 py-3 text-xs leading-5 ${ready ? 'cursor-pointer border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-slate-100 text-slate-500'}`}><input type="checkbox" checked={confirmed} disabled={!ready} onChange={(event) => onConfirmChange(event.target.checked)} className="mt-0.5 size-4 rounded accent-[var(--color-primary)]" /><span><span className="flex items-center gap-1.5 font-semibold"><FiAlertCircle /> I reviewed this preview</span>Only valid new rows will be added. Existing data will not be replaced.</span></label>
    {confirmed && <div className="flex items-center gap-2 border-t border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700"><FiCheckCircle /> Ready to import {preview.validRows.length} valid row{preview.validRows.length === 1 ? '' : 's'}.</div>}
  </div>
}

export default ImportPreview
