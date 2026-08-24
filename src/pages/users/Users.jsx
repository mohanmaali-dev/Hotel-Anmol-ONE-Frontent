import { useCallback, useEffect, useState } from 'react'
import { FiPlus, FiUsers } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { getUsers } from '../../api/userApi.js'
import Pagination from '../../components/Pagination.jsx'
import Toast from '../../components/Toast.jsx'
import UserFilters from '../../components/users/UserFilters.jsx'
import UserTable from '../../components/users/UserTable.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', role: '', status: '' }
const pageSize = 20

function Users() {
  const { can } = useAuth()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsers({ page, limit: pageSize, ...filters })
      setUsers(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (error) {
      setUsers([])
      setNotice({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.search, loadUsers])

  const updateFilter = (field, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">USER & ROLE MANAGEMENT</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Users</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiUsers /></span></div><p className="mt-1 text-sm text-slate-500">Manage staff accounts, roles, and what each person can access.</p></div>{can('users', 'create') && <Link to="/users/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add User</Link>}</div>
      <div className="space-y-5"><UserFilters filters={filters} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} /><UserTable users={users} total={pagination.total} loading={loading} canEdit={can('users', 'edit')} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="users" />}</div>
    </div></main>
  )
}

export default Users
