import { useEffect, useState } from 'react'
import { FiArrowLeft, FiEdit2, FiPower, FiShield, FiTrash2, FiUsers } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { deleteUser, getUser, updateUser } from '../../api/userApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import DangerZone from '../../components/DangerZone.jsx'
import Toast from '../../components/Toast.jsx'
import RolePermissions from '../../components/users/RolePermissions.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const DetailItem = ({ label, value }) => <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold text-slate-800">{value || '—'}</p></div>

function UserDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user: currentUser, can } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  useEffect(() => { getUser(id).then((result) => setUser(result.data)).catch((error) => setMessage({ type: 'error', text: error.message })).finally(() => setLoading(false)) }, [id])

  const handleToggle = async () => {
    setWorking(true)
    try {
      const result = await updateUser(user.id, { ...user, isActive: !user.isActive })
      setUser(result.data); setMessage({ type: 'success', text: `${result.data.fullName} is now ${result.data.isActive ? 'active' : 'inactive'}.` })
    } catch (error) { setMessage({ type: 'error', text: error.message }) } finally { setWorking(false) }
  }

  const handleDelete = async () => {
    setWorking(true)
    try { await deleteUser(user.id); navigate('/users', { state: { message: 'User deleted successfully.' } }) }
    catch (error) { setMessage({ type: 'error', text: error.message }); setWorking(false); setConfirmDelete(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /></main>
  if (!user) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiUsers className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">User not found</h2><p className="mt-2 text-sm text-rose-600">{message?.text}</p><Link to="/users" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"><FiArrowLeft /> Back to Users</Link></div></main>

  return <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
    <Toast message={message?.text} type={message?.type} onClose={() => setMessage(null)} />
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><Link to="/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Users</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{user.fullName}</h2><span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">{user.role}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></div></div><div className="flex flex-wrap gap-2">{can('users', 'edit') && <>{currentUser?.id !== user.id && currentUser?._id !== user.id && <button type="button" disabled={working} onClick={handleToggle} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-700"><FiPower /> {user.isActive ? 'Deactivate' : 'Activate'}</button>}<Link to={`/users/new?edit=${user.id}`} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white"><FiEdit2 /> Edit User</Link></>}</div></div>
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiShield /></span><h3 className="font-bold text-slate-900">Account Information</h3></div><div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"><DetailItem label="Full Name" value={user.fullName} /><DetailItem label="Username" value={user.username} /><DetailItem label="Email" value={user.email} /><DetailItem label="Phone" value={user.phone} /><DetailItem label="Role" value={user.role} /><DetailItem label="Status" value={user.isActive ? 'Active' : 'Inactive'} /></div></section>
    <RolePermissions permissions={user.permissions} readOnly />
    {can('users', 'delete') && currentUser?.id !== user.id && currentUser?._id !== user.id && <DangerZone title="Delete this user" description="Permanently remove this user account. This action cannot be undone."><button type="button" disabled={working} onClick={() => setConfirmDelete(true)} className="flex h-9 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><FiTrash2 /> Delete User</button></DangerZone>}
    <ConfirmDeleteModal open={confirmDelete} title={`Delete ${user.fullName}?`} message="This user account will be permanently removed. This action cannot be undone." confirmLabel="Delete User" loading={working} onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
  </div></main>
}

export default UserDetails
