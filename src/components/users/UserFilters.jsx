import { FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi'

import { userRoles } from '../../data/permissionOptions.js'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function UserFilters({ filters, onChange, onClear }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><FiFilter className="text-primary" /> Find Users</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <label className="relative"><span className="sr-only">Search user</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Search name, username, email, or phone" className={`${inputClass} pl-9`} /></label>
        <label><span className="sr-only">Filter by role</span><select value={filters.role} onChange={(event) => onChange('role', event.target.value)} className={inputClass}><option value="">All roles</option>{userRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
        <label><span className="sr-only">Filter by status</span><select value={filters.status} onChange={(event) => onChange('status', event.target.value)} className={inputClass}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></label>
        <button type="button" onClick={onClear} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiRefreshCw /> Reset</button>
      </div>
    </section>
  )
}

export default UserFilters
