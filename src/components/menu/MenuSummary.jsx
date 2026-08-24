import { FiCheckCircle, FiGrid, FiSlash, FiTag } from 'react-icons/fi'

import { isMenuItemAvailable } from '../../api/menuApi.js'

const cards = [
  { key: 'categories', label: 'Total Categories', icon: FiGrid, color: 'bg-blue-50 text-blue-700' },
  { key: 'items', label: 'Total Menu Items', icon: FiTag, color: 'bg-primary-light text-primary-dark' },
  { key: 'available', label: 'Available Items', icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-700' },
  { key: 'unavailable', label: 'Unavailable Items', icon: FiSlash, color: 'bg-rose-50 text-rose-700' },
]

function MenuSummary({ categories, items, counts, loading = false }) {
  const availableItems = items.filter((item) => isMenuItemAvailable(item, categories)).length
  const values = {
    categories: counts?.categories ?? categories.length,
    items: counts?.items ?? items.length,
    available: counts?.available ?? availableItems,
    unavailable: counts?.unavailable ?? items.length - availableItems,
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <article
          key={key}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{loading ? '—' : values[key]}</p>
            </div>
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
              <Icon className="text-xl" />
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}

export default MenuSummary
