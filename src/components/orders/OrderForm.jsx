import { useMemo, useState } from 'react'
import { FiAlertCircle, FiPlus, FiSave, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import OrderItemRow from './OrderItemRow.jsx'
import OrderSummary from './OrderSummary.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

const createRow = () => ({
  rowId: `${Date.now()}-${Math.random()}`,
  menuItemId: '',
  name: '',
  quantity: 1,
  rate: 0,
})

const areaOptions = {
  'Dine In': ['Indoor', 'Outdoor', 'Family Section', 'AC Hall'],
  Parcel: ['Takeaway Counter'],
  Room: ['Ground Floor', 'First Floor', 'Second Floor'],
}

function OrderForm({ onSave, menuItems, currentUser, submitting, apiError, onClearError }) {
  const { settings } = useSettings()
  const defaultOrderType = areaOptions[settings.order.defaultOrderType]
    ? settings.order.defaultOrderType
    : 'Dine In'
  const [form, setForm] = useState(() => ({
    orderType: defaultOrderType,
    areaType: areaOptions[defaultOrderType][0],
    areaRoomNo: '',
    customerName: '',
    discount: 0,
    additionalCharges: Number(settings.billing.defaultAdditionalCharge || 0),
    paymentType: 'Cash',
    paymentStatus: 'Paid',
  }))
  const [items, setItems] = useState([createRow()])
  const [validationError, setValidationError] = useState('')
  const error = validationError || apiError

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity) * Number(item.rate), 0),
    [items],
  )
  const discountAmount = settings.billing.allowDiscount
    ? Math.max(0, Number(form.discount || 0))
    : 0
  const additionalChargesAmount = Math.max(0, Number(form.additionalCharges || 0))
  const finalAmount = Math.max(0, subtotal - discountAmount + additionalChargesAmount)

  const updateForm = (field, value) => {
    setValidationError('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateOrderType = (orderType) => {
    setValidationError('')
    setForm((current) => ({
      ...current,
      orderType,
      areaType: areaOptions[orderType][0],
      areaRoomNo: '',
    }))
  }

  const updateItem = (rowId, field, value) => {
    setValidationError('')
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.rowId !== rowId) return item
        if (field === 'menuItemId') {
          const selectedItem = menuItems.find((menuItem) => menuItem.id === value)
          return {
            ...item,
            menuItemId: value,
            name: selectedItem?.name || '',
            rate: selectedItem?.rate || 0,
          }
        }
        if (field === 'quantity') {
          return { ...item, quantity: Math.max(1, Number(value) || 1) }
        }
        return item
      }),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const selectedItems = items.filter((item) => item.menuItemId)
    if (!form.areaRoomNo.trim() || !form.customerName.trim()) {
      setValidationError('Please enter the area or room number and customer name.')
      return
    }
    if (!selectedItems.length) {
      setValidationError('Please select at least one available menu item.')
      return
    }
    if (discountAmount > subtotal + additionalChargesAmount) {
      setValidationError('Discount cannot make the final amount negative.')
      return
    }

    setValidationError('')
    await onSave({
      ...form,
      biller: currentUser?._id || null,
      discount: discountAmount,
      additionalCharges: additionalChargesAmount,
      items: selectedItems.map(({ menuItemId, name, quantity, rate }) => ({
        menuItemId,
        name,
        quantity,
        rate,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => { setValidationError(''); onClearError?.() }} aria-label="Close error message" className="grid size-6 shrink-0 place-items-center rounded-md text-rose-500 hover:bg-rose-100">
            <FiX />
          </button>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <div>
          <h2 className="font-bold text-slate-900">Order Information</h2>
          <p className="mt-0.5 text-xs text-slate-500">Basic order and customer details</p>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700">Order Type</legend>
          <div className="grid grid-cols-3 gap-2 sm:max-w-md">
            {Object.keys(areaOptions).map((type) => (
              <button key={type} type="button" onClick={() => updateOrderType(type)} className={`h-10 rounded-lg border text-sm font-semibold transition ${form.orderType === type ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Area Type</span>
            <select value={form.areaType} onChange={(event) => updateForm('areaType', event.target.value)} className={inputClass}>
              {areaOptions[form.orderType].map((area) => <option key={area}>{area}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Area / Room No. <span className="text-rose-500">*</span></span>
            <input type="text" value={form.areaRoomNo} onChange={(event) => updateForm('areaRoomNo', event.target.value)} placeholder={form.orderType === 'Room' ? 'e.g. Room 104' : 'e.g. Table 08'} className={inputClass} required />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Customer Name <span className="text-rose-500">*</span></span>
            <input type="text" value={form.customerName} onChange={(event) => updateForm('customerName', event.target.value)} placeholder="Enter customer name" className={inputClass} required />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Biller</span>
            <input type="text" value={currentUser?.name || currentUser?.username || ''} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900">Order Items</h2>
            <p className="mt-0.5 text-xs text-slate-500">Select menu items and quantities</p>
          </div>
          <button type="button" onClick={() => setItems((current) => [...current, createRow()])} className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-primary/30 px-3 text-sm font-semibold text-primary-dark hover:bg-primary-light">
            <FiPlus /> Add Item
          </button>
        </div>

        <div className="mt-4 hidden grid-cols-[minmax(220px,2fr)_100px_130px_130px_40px] gap-3 border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <span>Menu Item</span><span>Quantity</span><span>Rate</span><span>Amount</span><span />
        </div>
        <div>
          {items.map((item) => (
            <OrderItemRow key={item.rowId} item={item} menuItems={menuItems} onChange={(field, value) => updateItem(item.rowId, field, value)} onRemove={() => setItems((current) => current.filter((row) => row.rowId !== item.rowId))} canRemove={items.length > 1} />
          ))}
        </div>
        {!menuItems.length && <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">No available menu items were found. Add or enable a menu item before creating an order.</p>}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <h2 className="font-bold text-slate-900">Payment</h2>
          <p className="mt-0.5 text-xs text-slate-500">Select payment method and status</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">Payment Type</legend>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'UPI', 'Card'].map((type) => <button key={type} type="button" onClick={() => updateForm('paymentType', type)} className={`h-10 min-w-20 rounded-lg border px-3 text-sm font-semibold ${form.paymentType === type ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{type}</button>)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">Payment Status</legend>
              <div className="flex flex-wrap gap-2">
                {['Paid', 'Not Paid'].map((status) => <button key={status} type="button" onClick={() => updateForm('paymentStatus', status)} className={`h-10 min-w-24 rounded-lg border px-3 text-sm font-semibold ${form.paymentStatus === status ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{status}</button>)}
              </div>
            </fieldset>
          </div>
        </section>

        <OrderSummary subtotal={subtotal} discount={form.discount} additionalCharges={form.additionalCharges} finalAmount={finalAmount} allowDiscount={settings.billing.allowDiscount} onChange={updateForm} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link to="/orders" className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
        <button type="submit" disabled={submitting || !menuItems.length} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
          <FiSave /> {submitting ? 'Saving Order...' : 'Save Order'}
        </button>
      </div>
    </form>
  )
}

export default OrderForm
