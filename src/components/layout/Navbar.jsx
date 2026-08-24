import { FiLogOut, FiMenu } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import GlobalSearch from './GlobalSearch.jsx'
import NotificationBell from './NotificationBell.jsx'

function Navbar({ onMenuClick, title = 'Dashboard', subtitle = 'Monday, 24 August 2026' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.name || user?.username || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur print:hidden sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <FiMenu className="text-xl" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
            <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <GlobalSearch />

          <NotificationBell />

          <div className="flex items-center gap-1 rounded-lg p-1.5 text-left sm:pr-2">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden lg:block">
              <span className="block max-w-36 truncate text-sm font-semibold leading-4 text-slate-800">{user?.name || user?.username}</span>
              <span className="block text-xs text-slate-500">{user?.role}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="ml-1 grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
