import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiEdit2, FiPlus, FiPower, FiTrash2, FiTruck } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { deleteSupplier, getSupplier, updateSupplier } from '../../api/supplierApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import DangerZone from '../../components/DangerZone.jsx'
import Toast from '../../components/Toast.jsx'
import SupplierPurchaseHistory from '../../components/suppliers/SupplierPurchaseHistory.jsx'
import SupplierSummary from '../../components/suppliers/SupplierSummary.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function DetailItem({ label, value }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold text-slate-800">{value || '—'}</p></div>
}

function SupplierDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  const loadSupplier = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getSupplier(id, 50)
      setSupplier(result.data)
    } catch (requestError) {
      setSupplier(null)
      setNotice({ type: 'error', text: requestError.message })
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { loadSupplier() }, [loadSupplier])

  const handleToggle = async () => {
    if (working) return
    setWorking(true)
    try {
      const result = await updateSupplier(supplier.id, { ...supplier, isActive: !supplier.isActive })
      await loadSupplier()
      setNotice({ type: 'success', text: `${result.data.name} is now ${result.data.isActive ? 'active' : 'inactive'}.` })
    } catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
    finally { setWorking(false) }
  }

  const handleDelete = async () => {
    setWorking(true)
    try {
      const result = await deleteSupplier(supplier.id)
      navigate('/suppliers', { state: { message: result.message } })
    } catch (requestError) { setNotice({ type: 'error', text: requestError.message }); setWorking(false); setConfirmDelete(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading supplier...</p></div></main>
  if (!supplier) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiTruck className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">Supplier not found</h2><p className="mt-2 text-sm text-rose-600">{notice?.text}</p><Link to="/suppliers" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Suppliers</Link></div></main>

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><Link to="/suppliers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Suppliers</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{supplier.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${supplier.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{supplier.isActive ? 'Active' : 'Inactive'}</span></div><p className="mt-1 text-sm text-slate-500">Supplier information and purchase history.</p></div>
        <div className="flex flex-wrap gap-2">{can('suppliers', 'edit') && <><button type="button" disabled={working} onClick={handleToggle} className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold disabled:opacity-50 ${supplier.isActive ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}><FiPower /> {supplier.isActive ? 'Deactivate' : 'Activate'}</button><Link to={`/suppliers/new?edit=${supplier.id}`} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiEdit2 /> Edit Supplier</Link></>}{can('purchases', 'create') && <Link to={`/purchases/new?supplier=${supplier.id}`} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Create Purchase</Link>}</div>
      </div>
      <SupplierSummary supplier={supplier} />
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiTruck /></span><h3 className="font-bold text-slate-900">Basic Supplier Information</h3></div><div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"><DetailItem label="Supplier Name" value={supplier.name} /><DetailItem label="Contact Person" value={supplier.contactPerson} /><DetailItem label="Phone" value={supplier.phone} /><DetailItem label="Alternate Phone" value={supplier.alternatePhone} /><DetailItem label="Email" value={supplier.email} /><DetailItem label="GST / Tax No." value={supplier.gstTaxNo} /><DetailItem label="Status" value={supplier.isActive ? 'Active' : 'Inactive'} /><DetailItem label="Total Purchases" value={String(supplier.totalPurchases)} /><div className="col-span-2 sm:col-span-3 lg:col-span-4"><DetailItem label="Address" value={supplier.address} /></div><div className="col-span-2 sm:col-span-3 lg:col-span-4"><DetailItem label="Notes" value={supplier.notes} /></div></div></section>
      <div className="mt-6"><SupplierPurchaseHistory purchases={supplier.purchaseHistory || []} /></div>
      {can('suppliers', 'delete') && <DangerZone title="Delete this supplier" description="Permanently remove this supplier. Suppliers with purchase history are protected and cannot be deleted."><button type="button" disabled={working} onClick={() => setConfirmDelete(true)} className="flex h-9 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><FiTrash2 /> Delete Supplier</button></DangerZone>}
      <ConfirmDeleteModal open={confirmDelete} title={`Delete ${supplier.name}?`} message="This supplier will be permanently removed." dependencyType="supplier" recordId={supplier.id} confirmLabel="Delete Supplier" loading={working} onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
    </div></main>
  )
}

export default SupplierDetails
