import { useEffect, useRef, useState } from 'react'
import { FiAlertTriangle, FiExternalLink, FiRefreshCw, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { checkDeleteDependencies } from '../api/dependencyApi.js'

function ConfirmDeleteModal({ open, title, message, dependencyType, recordId, confirmLabel = 'Delete', loading = false, onConfirm, onClose }) {
  const cancelButtonRef = useRef(null)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [dependencyResult, setDependencyResult] = useState(null)
  const [checkVersion, setCheckVersion] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    if (!dependencyType || !recordId) {
      setDependencyResult({ canDelete: true, dependencies: [] })
      setCheckError('')
      setChecking(false)
      return undefined
    }

    let active = true
    setChecking(true)
    setCheckError('')
    setDependencyResult(null)
    checkDeleteDependencies(dependencyType, recordId)
      .then((result) => { if (active) setDependencyResult(result.data) })
      .catch(() => { if (active) setCheckError('We could not check this item. Please try again.') })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [checkVersion, dependencyType, open, recordId])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [loading, onClose, open])

  if (!open) return null
  const isBlocked = dependencyResult?.canDelete === false

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose() }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-message" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700"><FiAlertTriangle /></span>
          <div className="min-w-0 flex-1">
            <h2 id="delete-dialog-title" className="text-lg font-bold text-slate-900">{isBlocked ? 'Cannot Delete' : title}</h2>
            <p id="delete-dialog-message" className="mt-1.5 text-sm leading-6 text-slate-600">{isBlocked ? 'Used in:' : message}</p>
          </div>
          <button type="button" disabled={loading} onClick={onClose} aria-label="Close confirmation" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><FiX /></button>
        </div>

        {checking && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-600">
            <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
            Please wait...
          </div>
        )}

        {checkError && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3">
            <p className="text-sm font-semibold text-rose-700">Unable to continue</p>
            <p className="mt-1 text-sm text-rose-600">{checkError}</p>
            <button type="button" onClick={() => setCheckVersion((value) => value + 1)} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-2.5 text-xs font-semibold text-rose-700"><FiRefreshCw /> Try Again</button>
          </div>
        )}

        {isBlocked && (
          <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-slate-200">
            <div className="divide-y divide-slate-200">
              {dependencyResult.dependencies.map((dependency) => (
                <section key={`${dependency.module}-${dependency.label}`} className="p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{dependency.label}</p>
                    <span className="text-xs font-semibold text-slate-500">{dependency.count}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{dependency.guidance}</p>

                  {dependency.records?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {dependency.records.map((record) => (
                        <Link key={record.id} to={record.path} onClick={onClose} className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-primary-light px-2.5 py-1.5 text-xs font-semibold text-primary-dark hover:bg-primary/20">
                          <span className="truncate">{record.label}</span>
                          <FiExternalLink className="shrink-0" />
                        </Link>
                      ))}
                      {dependency.count > dependency.records.length && <span className="px-1 py-1.5 text-xs text-slate-500">+{dependency.count - dependency.records.length} more</span>}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelButtonRef} type="button" disabled={loading} onClick={onClose} className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">{isBlocked ? 'Close' : 'Cancel'}</button>
          {(!dependencyResult || dependencyResult.canDelete) && (
            <button type="button" disabled={loading || checking || Boolean(checkError) || dependencyResult?.canDelete !== true} onClick={onConfirm} className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"><FiTrash2 /> {loading ? 'Deleting...' : confirmLabel}</button>
          )}
        </div>
      </section>
    </div>
  )
}

export default ConfirmDeleteModal
