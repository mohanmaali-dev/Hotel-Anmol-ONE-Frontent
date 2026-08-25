import { useCallback, useEffect, useState } from 'react'
import { FiPlus, FiTruck } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { deleteSupplier, getSuppliers } from '../../api/supplierApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import Pagination from '../../components/Pagination.jsx'
import SupplierFilters from '../../components/suppliers/SupplierFilters.jsx'
import SupplierTable from '../../components/suppliers/SupplierTable.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { name: '', phone: '', status: '' }
const pageSize = 20

function Suppliers() {
  const location = useLocation()
  const { can } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')
  const [supplierToDelete, setSupplierToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadSuppliers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const search = filters.phone.trim() || filters.name.trim()
      const result = await getSuppliers({ page, limit: pageSize, ...(search ? { search } : {}), ...(filters.status ? { status: filters.status } : {}) })
      setSuppliers(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      setSuppliers([])
      setError(requestError.message)
    } finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(loadSuppliers, filters.name || filters.phone ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.name, filters.phone, loadSuppliers])

  const updateFilter = (field, value) => { setPage(1); setFilters((current) => ({ ...current, [field]: value })) }

  const handleDelete = async () => {
    if (!supplierToDelete || deleting) return
    setDeleting(true)
    try {
      const result = await deleteSupplier(supplierToDelete.id)
      setSupplierToDelete(null)
      setMessage(result.message || 'Supplier deleted.')
      if (suppliers.length === 1 && page > 1) setPage((current) => current - 1)
      else await loadSuppliers()
    } catch (requestError) {
      setSupplierToDelete(null)
      setError(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={error || message} type={error ? 'error' : 'success'} onClose={() => { setError(''); setMessage('') }} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">SUPPLIER MANAGEMENT</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Suppliers</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiTruck /></span></div><p className="mt-1 text-sm text-slate-500">Manage supplier contacts and purchase balances.</p></div>{can('suppliers', 'create') && <Link to="/suppliers/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add Supplier</Link>}</div>
      <div className="space-y-5"><SupplierFilters filters={filters} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} /><SupplierTable suppliers={suppliers} total={pagination.total} loading={loading} canDelete={can('suppliers', 'delete')} onDelete={setSupplierToDelete} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="suppliers" />}</div>
      <ConfirmDeleteModal
        open={Boolean(supplierToDelete)}
        title={`Delete ${supplierToDelete?.name || 'supplier'}?`}
        message="This supplier will be permanently removed."
        dependencyType="supplier"
        recordId={supplierToDelete?.id}
        confirmLabel="Delete Supplier"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => { if (!deleting) setSupplierToDelete(null) }}
      />
    </div></main>
  )
}

export default Suppliers
