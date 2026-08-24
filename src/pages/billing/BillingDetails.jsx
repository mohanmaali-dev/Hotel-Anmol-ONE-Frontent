import { useEffect, useState } from 'react'
import { FiAlertCircle, FiArrowLeft, FiDownload, FiFileText, FiPrinter, FiTrendingUp, FiX } from 'react-icons/fi'
import { Link, useLocation, useParams } from 'react-router-dom'

import { getBillDetails, updateBillPayment } from '../../api/billingApi.js'
import BillDetails from '../../components/billing/BillDetails.jsx'
import BillSummary from '../../components/billing/BillSummary.jsx'
import PaymentSection from '../../components/billing/PaymentSection.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

function createBillText(bill, settings) {
  const currency = settings.restaurant.currency
  const itemLines = bill.items.map((item) => `${item.name} | ${item.quantity} x ${formatCurrency(item.rate, currency)} | ${formatCurrency(item.amount, currency)}`)
  return [
    settings.restaurant.name.toUpperCase(), 'Restaurant Bill', '',
    `Bill No: ${bill.billNo}`, `Order No: ${bill.orderNo}`,
    `Date: ${formatOrderDate(bill.date, true)}`, `Customer: ${bill.customerName}`,
    `Order Type: ${bill.orderType}`, `Biller: ${bill.billerName || (bill.biller ? 'Assigned user' : '—')}`,
    '', 'ORDER ITEMS', ...itemLines, '',
    `Subtotal: ${formatCurrency(bill.subtotal, currency)}`, `Discount: ${formatCurrency(bill.discount, currency)}`,
    `Additional Charges: ${formatCurrency(bill.additionalCharges, currency)}`, `Final Amount: ${formatCurrency(bill.finalAmount, currency)}`,
    `Payment Type: ${bill.paymentType || '—'}`, `Paid Amount: ${formatCurrency(bill.paidAmount, currency)}`,
    `Due Amount: ${formatCurrency(bill.dueAmount, currency)}`, `Payment Status: ${bill.paymentStatus}`,
    '', settings.billing.footerMessage,
  ].join('\n')
}

function BillingDetails() {
  const { id } = useParams()
  const location = useLocation()
  const { user, can } = useAuth()
  const { settings } = useSettings()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')

  useEffect(() => {
    let active = true
    setLoading(true)
    getBillDetails(id)
      .then((result) => {
        if (!active) return
        const value = result.data
        setBill({
          ...value,
          billerName:
            String(value.biller) === String(user?._id) ? user.name : value.billerName,
        })
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, user?._id, user?.name])

  const handlePaymentUpdate = async (payment) => {
    if (updating) return
    setUpdating(true)
    setError('')
    try {
      const updateResult = await updateBillPayment(bill.id, payment)
      let value = { ...bill, ...updateResult.data }
      try {
        const refreshed = await getBillDetails(bill.id)
        value = refreshed.data
      } catch {
        // The payment response is authoritative if the follow-up refresh is unavailable.
      }
      setBill({
        ...value,
        billerName:
          String(value.biller) === String(user?._id) ? user.name : value.billerName,
      })
      setMessage(`${updateResult.message} Status: ${value.paymentStatus}.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDownload = () => {
    const file = new Blob([createBillText(bill, settings)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `${bill.billNo}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading bill...</p></div></main>

  if (!bill) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-2xl text-slate-400"><FiFileText /></span><h2 className="mt-4 text-xl font-bold text-slate-900">Bill not found</h2><p className="mt-1 text-sm text-slate-500">{error || 'The requested bill does not exist.'}</p><Link to="/billing" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Billing</Link></div></main>

  const saleNo = bill.billNo.replace(/^[^-]+-/, 'SALE-')

  return (
    <main className="print-area px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <Toast message={message} type="success" onClose={() => setMessage('')} />
        {error && <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 print:hidden"><FiAlertCircle className="mt-0.5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close payment error" className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}

        <div className="mb-6 flex flex-col justify-between gap-4 print:hidden sm:flex-row sm:items-end">
          <div><Link to="/billing" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Billing</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Bill Details</h2><p className="mt-1 text-sm text-slate-500">Review the bill and update payment details.</p></div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/orders/${bill.orderId}`} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><FiArrowLeft /> View Order</Link>
            {can('sales', 'view') && <Link to={`/sales/${saleNo}`} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><FiTrendingUp /> View Sale</Link>}
            <button type="button" onClick={() => window.print()} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><FiPrinter /> Print Bill</button>
            <button type="button" onClick={handleDownload} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"><FiDownload /> Download Bill</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
          <BillDetails bill={bill} restaurantName={settings.restaurant.name} currency={settings.restaurant.currency} />
          <div className="space-y-6"><BillSummary bill={bill} currency={settings.restaurant.currency} /><PaymentSection bill={bill} onUpdate={handlePaymentUpdate} updating={updating} canEdit={can('billing', 'edit')} /></div>
        </div>
        <p className="mt-8 hidden text-center text-xs text-slate-500 print:block">{settings.billing.footerMessage}</p>
      </div>
    </main>
  )
}

export default BillingDetails
