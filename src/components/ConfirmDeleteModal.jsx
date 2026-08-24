import { useEffect, useRef } from 'react'
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi'

function ConfirmDeleteModal({ open, title, message, confirmLabel = 'Delete', loading = false, onConfirm, onClose }) {
  const cancelButtonRef = useRef(null)

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

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose() }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-message" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700"><FiAlertTriangle /></span>
          <div className="min-w-0 flex-1">
            <h2 id="delete-dialog-title" className="text-lg font-bold text-slate-900">{title}</h2>
            <p id="delete-dialog-message" className="mt-1.5 text-sm leading-6 text-slate-600">{message}</p>
          </div>
          <button type="button" disabled={loading} onClick={onClose} aria-label="Close confirmation" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><FiX /></button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelButtonRef} type="button" disabled={loading} onClick={onClose} className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
          <button type="button" disabled={loading} onClick={onConfirm} className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"><FiTrash2 /> {loading ? 'Deleting...' : confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDeleteModal
