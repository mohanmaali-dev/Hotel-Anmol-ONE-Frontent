import { useRef } from 'react'
import { FiCalendar } from 'react-icons/fi'

function DatePickerField({ label, value, onChange, className = '' }) {
  const inputRef = useRef(null)
  const formattedDate = value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        timeZone: 'UTC',
      }).format(new Date(`${value}T00:00:00Z`))
    : 'DD/MM/YY'

  const openPicker = () => {
    if (typeof inputRef.current?.showPicker === 'function') inputRef.current.showPicker()
    else inputRef.current?.click()
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      <button type="button" onClick={openPicker} className="flex h-10 min-w-0 w-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white text-left outline-none hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10">
        <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-500">{label}</span>
        <span className={`flex min-w-0 flex-1 items-center px-2.5 text-sm ${value ? 'text-slate-700' : 'text-slate-400'}`}>{formattedDate}</span>
        <FiCalendar className="mr-2.5 shrink-0 self-center text-slate-400" />
      </button>
      <input ref={inputRef} type="date" value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} date`} tabIndex="-1" className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />
    </div>
  )
}

export default DatePickerField
