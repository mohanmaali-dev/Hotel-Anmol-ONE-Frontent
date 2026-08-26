import { useEffect, useState } from 'react'
import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import { getAvailableMenuItemsForOrder } from '../../api/menuApi.js'
import { createOrder } from '../../api/orderApi.js'
import OrderForm from '../../components/orders/OrderForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function NewOrder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [menuRequestKey, setMenuRequestKey] = useState(0)
  const [menuError, setMenuError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let active = true
    setLoadingMenu(true)
    setMenuError('')
    getAvailableMenuItemsForOrder()
      .then((items) => { if (active) setMenuItems(items) })
      .catch((requestError) => { if (active) setMenuError(requestError.message) })
      .finally(() => { if (active) setLoadingMenu(false) })
    return () => { active = false }
  }, [menuRequestKey])

  const handleSave = async (order) => {
    if (submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await createOrder(order)
      navigate(`/orders/${result.data.id}`, {
        replace: true,
        state: { message: result.message || 'Order saved successfully.' },
      })
    } catch (requestError) {
      setSubmitError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <div className="mb-6">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Orders</Link>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Create New Order</h2>
          <p className="mt-1 text-sm text-slate-500">Enter the order details and add menu items.</p>
        </div>

        {loadingMenu ? (
          <div className="grid min-h-72 place-items-center rounded-xl border border-slate-200 bg-white">
            <div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading available menu items...</p></div>
          </div>
        ) : menuError ? (
          <div className="grid min-h-72 place-items-center rounded-xl border border-rose-200 bg-white px-5 text-center">
            <div>
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-rose-50 text-xl text-rose-600"><FiAlertCircle /></span>
              <h2 className="mt-3 font-bold text-slate-900">Menu items could not be loaded</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">{menuError}</p>
              <button type="button" onClick={() => setMenuRequestKey((current) => current + 1)} className="mx-auto mt-4 flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
                <FiRefreshCw /> Try Again
              </button>
            </div>
          </div>
        ) : (
          <OrderForm onSave={handleSave} menuItems={menuItems} currentUser={user} submitting={submitting} apiError={submitError} onClearError={() => setSubmitError('')} />
        )}
      </div>
    </main>
  )
}

export default NewOrder
