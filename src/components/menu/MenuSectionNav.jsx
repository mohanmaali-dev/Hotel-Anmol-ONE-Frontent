import { FiGrid, FiHome, FiTag } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'

const sections = [
  {
    to: '/menu',
    end: true,
    label: 'Overview',
    icon: FiHome,
  },
  {
    to: '/menu/items',
    label: 'Menu Items',
    icon: FiTag,
  },
  {
    to: '/menu/categories',
    label: 'Categories',
    icon: FiGrid,
  },
]

function MenuSectionNav() {
  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="px-1">
          <h3 className="text-sm font-semibold text-slate-800">Menu Sections</h3>
          <p className="mt-0.5 text-xs text-slate-500">Menu Items are dishes customers order. Categories organize those items.</p>
        </div>
        <nav className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 lg:w-auto" aria-label="Menu management sections">
          {sections.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-xs font-semibold transition-colors sm:text-sm ${isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
            >
              <Icon className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </section>
  )
}

export default MenuSectionNav
