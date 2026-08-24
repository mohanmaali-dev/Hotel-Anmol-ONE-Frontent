import { useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAvailableMenuItemsForOrder()
      .then((items) => { if (active) setMenuItems(items) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoadingMenu(false) })
    return () => { active = false }
  }, [])

  const handleSave = async (order) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const result = await createOrder(order)
      navigate(`/orders/${result.data.id}`, {
        replace: true,
        state: { message: result.message || 'Order saved successfully.' },
      })
    } catch (requestError) {
      setError(requestError.message)
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
        ) : (
          <OrderForm onSave={handleSave} menuItems={menuItems} currentUser={user} submitting={submitting} apiError={error} onClearError={() => setError('')} />
        )}
      </div>
    </main>
  )
}

export default NewOrder
