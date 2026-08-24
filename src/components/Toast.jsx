import { useEffect, useRef } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

const styles = {
  success: {
    container: 'border-emerald-200 bg-white text-slate-700',
    icon: 'bg-emerald-50 text-emerald-600',
    Icon: FiCheckCircle,
  },
  error: {
    container: 'border-rose-200 bg-white text-slate-700',
    icon: 'bg-rose-50 text-rose-600',
    Icon: FiAlertCircle,
  },
  info: {
    container: 'border-blue-200 bg-white text-slate-700',
    icon: 'bg-blue-50 text-blue-600',
    Icon: FiInfo,
  },
}

function Toast({ message, type = 'success', onClose, duration = 4500 }) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!message || duration <= 0) return undefined
    const timer = window.setTimeout(() => onCloseRef.current?.(), duration)
    return () => window.clearTimeout(timer)
  }, [duration, message])

  if (!message) return null

  const style = styles[type] || styles.info
  const Icon = style.Icon

  return (
    <div className="fixed right-4 top-20 z-[70] w-[calc(100%-2rem)] max-w-sm print:hidden" role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}>
      <div className={`flex items-start gap-3 rounded-xl border p-3.5 shadow-lg shadow-slate-900/10 ${style.container}`}>
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${style.icon}`}><Icon /></span>
        <p className="min-w-0 flex-1 pt-1 text-sm font-medium leading-5">{message}</p>
        <button type="button" onClick={onClose} aria-label="Close message" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><FiX /></button>
      </div>
    </div>
  )
}

export default Toast
