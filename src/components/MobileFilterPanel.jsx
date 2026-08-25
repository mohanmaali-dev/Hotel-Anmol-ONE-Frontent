import { useId, useState } from 'react'
import { FiChevronDown, FiChevronUp, FiFilter } from 'react-icons/fi'

function MobileFilterPanel({ children, filters = {}, title = 'Filters', className = 'p-4' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const contentId = useId()
  const activeCount = Object.values(filters).filter(
    (value) => value !== '' && value !== null && value !== undefined && value !== false,
  ).length

  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 ${className}`}>
      <div className={`flex items-center justify-between gap-3 ${mobileOpen ? 'mb-3' : 'sm:mb-3'}`}>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <FiFilter className="text-primary" /> {title}
          {activeCount > 0 && (
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary-dark">
              {activeCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-expanded={mobileOpen}
          aria-controls={contentId}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:hidden"
        >
          {mobileOpen ? <><FiChevronUp /> Hide Filters</> : <><FiChevronDown /> Show Filters</>}
        </button>
      </div>
      <div id={contentId} className={mobileOpen ? 'block' : 'hidden sm:block'}>
        {children}
      </div>
    </section>
  )
}

export default MobileFilterPanel
