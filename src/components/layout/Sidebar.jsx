import { NavLink } from 'react-router-dom'

import BrandLogo from '../BrandLogo.jsx'
import {
  FiBarChart2,
  FiBookOpen,
  FiBox,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiSettings,
  FiShoppingBag,
  FiShoppingCart,
  FiTruck,
  FiUploadCloud,
  FiUsers,
  FiX,
} from 'react-icons/fi'

import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'

const menuItems = [
  { label: 'Dashboard', permissionKey: 'Dashboard', icon: FiGrid, path: '/dashboard' },
  { label: 'Orders', permissionKey: 'Orders', icon: FiShoppingBag, path: '/orders' },
  { label: 'Billing', permissionKey: 'Billing', icon: FiCreditCard, path: '/billing' },
  { label: 'Sales', permissionKey: 'Sales', icon: FiBarChart2, path: '/sales' },
  { label: 'Purchases', permissionKey: 'Purchases', icon: FiShoppingCart, path: '/purchases' },
  { label: 'Stock', permissionKey: 'Stock', icon: FiBox, path: '/stock' },
  { label: 'Menu', permissionKey: 'Menu', icon: FiBookOpen, path: '/menu' },
  { label: 'Suppliers', permissionKey: 'Suppliers', icon: FiTruck, path: '/suppliers' },
  { label: 'Expenses', permissionKey: 'Expenses', icon: FiDollarSign, path: '/expenses' },
  { label: 'Reports', permissionKey: 'Reports', icon: FiFileText, path: '/reports' },
  { label: 'Users', permissionKey: 'Users', icon: FiUsers, path: '/users' },
  { label: 'Excel', permissionKey: 'Settings', icon: FiUploadCloud, path: '/excel' },
  { label: 'Settings', permissionKey: 'Settings', icon: FiSettings, path: '/settings' },
]

const itemClass =
  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors'

function Sidebar({ isOpen, onClose, permissions }) {
  const { user, can } = useAuth()
  const { settings } = useSettings()
  const activePermissions = permissions || user?.permissions
  const visibleItems = activePermissions
    ? menuItems.filter((item) => {
        if (Array.isArray(activePermissions)) {
          return activePermissions.some(
            (permission) =>
              permission.module?.toLowerCase() === item.permissionKey.toLowerCase() &&
              permission.actions?.includes('view'),
          )
        }
        return activePermissions[item.permissionKey]?.view
      })
    : menuItems.filter((item) => can(item.permissionKey, 'view'))

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] print:hidden lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 print:hidden lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3">
            <BrandLogo className="max-w-42" />
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Main navigation">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Main menu
          </p>
          <div className="space-y-1">
            {visibleItems.map(({ label, icon: Icon, path }) =>
              path ? (
                <NavLink
                  key={label}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${itemClass} ${
                      isActive
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="text-lg" />
                  {label}
                </NavLink>
              ) : (
                <button
                  key={label}
                  type="button"
                  className={`${itemClass} text-slate-600 hover:bg-slate-50 hover:text-slate-900`}
                >
                  <Icon className="text-lg" />
                  {label}
                </button>
              ),
            )}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-dark text-xs font-bold text-white">
                {(settings.restaurant.name || 'Restaurant').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">{settings.restaurant.name || 'Restaurant'}</span>
                <span className="block truncate text-xs text-slate-500">Main Branch</span>
              </span>
              <FiUsers className="ml-auto shrink-0 text-slate-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
