import { FiEdit2, FiEye, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const roleClasses = {
  Admin: 'bg-violet-50 text-violet-700',
  Manager: 'bg-blue-50 text-blue-700',
  Cashier: 'bg-cyan-50 text-cyan-700',
  Waiter: 'bg-orange-50 text-orange-700',
  Staff: 'bg-slate-100 text-slate-600',
}

function UserTable({ users, total = users.length, loading = false, canEdit = false }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">User Accounts</h2><p className="mt-0.5 text-xs text-slate-500">{loading ? 'Loading users...' : `${total} user${total === 1 ? '' : 's'} found`}</p></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="text-slate-700">
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-light text-sm font-bold text-primary-dark">{user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><Link to={`/users/${user.id}`} className="record-link" title="View user details">{user.fullName}</Link></div></td>
                <td className="px-4 py-3.5 font-medium text-slate-800">{user.username}</td>
                <td className="px-4 py-3.5 text-slate-600">{user.email || 'Not added'}</td>
                <td className="whitespace-nowrap px-4 py-3.5">{user.phone}</td>
                <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleClasses[user.role]}`}>{user.role}</span></td>
                <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><span className={`size-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-5 py-3.5"><div className="flex justify-end gap-2"><Link to={`/users/${user.id}`} aria-label={`View ${user.fullName}`} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary-dark"><FiEye /></Link>{canEdit && <Link to={`/users/new?edit=${user.id}`} aria-label={`Edit ${user.fullName}`} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary-dark"><FiEdit2 /></Link>}</div></td>
              </tr>
            ))}
            {!loading && !users.length && <tr><td colSpan="7" className="px-5 py-12 text-center"><FiUsers className="mx-auto text-3xl text-slate-300" /><p className="mt-3 font-medium text-slate-600">No users match these filters.</p></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default UserTable
