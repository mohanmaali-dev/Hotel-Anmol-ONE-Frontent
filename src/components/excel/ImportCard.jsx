import { useRef, useState } from 'react'
import { FiDownload, FiEye, FiFile, FiUploadCloud, FiX } from 'react-icons/fi'

import { createFilePreview, downloadSampleTemplate, formatFileSize, validateImportFile } from '../../utils/excelHelpers.js'
import ImportPreview from './ImportPreview.jsx'

function ImportCard({ type, onImport }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const cancel = () => { setFile(null); setPreview(null); setConfirmed(false); setError(''); setResult(null); if (inputRef.current) inputRef.current.value = '' }
  const chooseFile = (event) => { const selected = event.target.files?.[0]; const validationError = validateImportFile(selected); setError(validationError); setFile(validationError ? null : selected); setPreview(null); setConfirmed(false); setResult(null); if (validationError) event.target.value = '' }
  const showPreview = async () => { try { setError(''); setPreview(await createFilePreview(file, type)) } catch (previewError) { setError(previewError.message || 'This file could not be previewed.'); setPreview(null) } }
  const importData = async () => { setImporting(true); setError(''); try { setResult(await onImport(type, preview.validRows, preview)); setConfirmed(false) } catch (requestError) { setError(requestError.message) } finally { setImporting(false) } }

  return <article className={`rounded-xl border bg-white p-5 shadow-sm ${type.disabled ? 'border-slate-200 opacity-75' : 'border-slate-200'}`}>
    <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary-dark"><FiUploadCloud /></span><div><h2 className="font-bold text-slate-900">{type.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{type.description}</p></div></div>{!type.disabled && <button type="button" onClick={() => downloadSampleTemplate(type)} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><FiDownload /> <span className="hidden sm:inline">Sample Template</span></button>}</div>
    {type.disabled ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800">Use the normal Order → Bill → Sale flow to preserve totals, generated numbers, payments, and inventory history.</div> : <>
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center"><input ref={inputRef} id={`file-${type.id}`} type="file" accept=".xlsx,.xls,.csv" onChange={chooseFile} className="hidden" /><FiFile className="mx-auto text-2xl text-slate-400" /><p className="mt-2 text-sm font-semibold text-slate-700">Choose an Excel or CSV file</p><p className="mt-1 text-xs text-slate-400">Accepted: .xlsx, .xls, .csv — maximum 10 MB</p><label htmlFor={`file-${type.id}`} className="mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-3.5 text-sm font-semibold text-white">Choose File</label></div>
      {error && <div className="mt-3 flex items-start justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700"><span>{error}</span><button type="button" onClick={() => setError('')}><FiX /></button></div>}
      {file && <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-3"><FiFile className="text-primary" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-700">{file.name}</span><span className="block text-xs text-slate-400">{formatFileSize(file.size)}</span></span><button type="button" onClick={showPreview} className="flex h-9 items-center gap-2 rounded-lg border border-primary/30 px-3 text-xs font-semibold text-primary-dark"><FiEye /> Preview</button><button type="button" onClick={cancel} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600">Cancel</button></div>}
      {preview && <ImportPreview preview={preview} confirmed={confirmed} onConfirmChange={setConfirmed} />}
      {preview && !result && <div className="mt-4 flex justify-end"><button type="button" disabled={!confirmed || importing} onClick={importData} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"><FiUploadCloud /> {importing ? 'Importing...' : 'Import Data'}</button></div>}
      {result && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs text-emerald-800"><p className="font-bold">Import finished</p><p className="mt-1">Total: {result.totalRows} · Imported: {result.imported} · Skipped: {result.skipped} · Failed: {result.failed}</p>{result.createdCategories > 0 && <p className="mt-1">New categories added: {result.createdCategories}</p>}{result.errors.length > 0 && <div className="mt-2 max-h-28 overflow-y-auto text-rose-700">{result.errors.map((item, index) => <p key={`${item.row}-${index}`}>Row {item.row}: {item.message}</p>)}</div>}<button type="button" onClick={cancel} className="mt-3 rounded-md border border-emerald-300 px-2.5 py-1 font-semibold">Done</button></div>}
    </>}
  </article>
}

export default ImportCard
