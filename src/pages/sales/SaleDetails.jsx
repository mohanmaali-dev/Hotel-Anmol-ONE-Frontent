import { useEffect, useState } from 'react'
import { FiArrowLeft, FiFileText, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'

import { getSaleDetails } from '../../api/salesApi.js'
import SaleDetailsContent from '../../components/sales/SaleDetails.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function SaleDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    getSaleDetails(id)
      .then((result) => {
        if (!active) return
        const value = result.data
        setSale({
          ...value,
          billerName:
            String(value.biller) === String(user?._id) ? user.name : value.billerName,
        })
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, user?._id, user?.name])

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading sale...</p></div></main>

  if (!sale) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-2xl text-slate-400"><FiTrendingUp /></span><h2 className="mt-4 text-xl font-bold text-slate-900">Sale not found</h2><p className="mt-1 text-sm text-slate-500">{error || 'The related bill may no longer exist.'}</p><Link to="/sales" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Sales</Link></div></main>

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><Link to="/sales" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Sales</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Sale Details</h2><p className="mt-1 text-sm text-slate-500">Complete order, bill, and payment information.</p></div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/orders/${sale.orderId}`} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><FiShoppingBag /> View Order</Link>
            <Link to={`/billing/${sale.billId}`} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"><FiFileText /> View Bill</Link>
          </div>
        </div>
        <SaleDetailsContent sale={sale} />
      </div>
    </main>
  )
}

export default SaleDetails
