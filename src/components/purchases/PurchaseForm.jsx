import { useMemo, useState } from 'react'
import { FiAlertCircle, FiPlus, FiSave, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import PurchaseItemRow from './PurchaseItemRow.jsx'
import PurchasePayment from './PurchasePayment.jsx'
import PurchaseSummary from './PurchaseSummary.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

const createRow = (item = {}) => ({
  rowId: `${Date.now()}-${Math.random()}`,
  itemId: item.itemId || '',
  name: item.name || '',
  quantity: item.quantity || 1,
  unit: item.unit || 'kg',
  purchasePrice: item.purchasePrice || 0,
})

function todayDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function PurchaseForm({ initialPurchase, preselectedSupplierId = '', suppliers, availableItems, onSave, submitting, apiError, onClearError }) {
  const initialSupplierId = initialPurchase?.supplierId || preselectedSupplierId
  const selectableSuppliers = suppliers.filter(
    (supplier) => supplier.isActive || supplier.id === initialSupplierId,
  )
  const [form, setForm] = useState({
    supplierId: initialSupplierId,
    purchaseDate: initialPurchase?.purchaseDate?.slice(0, 10) || todayDate(),
    invoiceNo: initialPurchase?.invoiceNo || '',
    notes: initialPurchase?.notes || '',
    discount: initialPurchase?.discount || 0,
    additionalCharges: initialPurchase?.additionalCharges || 0,
    paymentType: initialPurchase?.paymentType || 'Cash',
    paidAmount: initialPurchase?.paidAmount || 0,
    purchaseStatus: initialPurchase?.purchaseStatus || 'Draft',
  })
  const [items, setItems] = useState(
    initialPurchase?.items?.length ? initialPurchase.items.map(createRow) : [createRow()],
  )
  const [validationError, setValidationError] = useState('')
  const error = validationError || apiError

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.purchasePrice, 0),
    [items],
  )
  const discount = Math.max(0, Number(form.discount) || 0)
  const additionalCharges = Math.max(0, Number(form.additionalCharges) || 0)
  const finalAmount = Math.max(0, subtotal - discount + additionalCharges)
  const paidAmount = Math.max(0, Number(form.paidAmount) || 0)
  const updateForm = (field, value) => {
    setValidationError('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateItem = (rowId, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.rowId !== rowId) return item

        if (field === 'itemId') {
          const selected = availableItems.find((purchaseItem) => purchaseItem.id === value)
          return {
            ...item,
            itemId: value,
            name: selected?.name || '',
            unit: selected?.unit || item.unit,
            purchasePrice: selected?.purchasePrice || 0,
          }
        }

        if (field === 'quantity') {
          return { ...item, quantity: Math.max(1, Number(value) || 1) }
        }

        if (field === 'purchasePrice') {
          return { ...item, purchasePrice: Math.max(0, Number(value) || 0) }
        }

        return { ...item, [field]: value }
      }),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const selectedItems = items.filter((item) => item.itemId)

    if (!form.supplierId || !form.purchaseDate || !form.invoiceNo.trim()) {
      setValidationError('Please select a supplier and enter the purchase date and invoice number.')
      return
    }

    if (!selectedItems.length) {
      setValidationError('Please select at least one purchase item.')
      return
    }
    if (new Set(selectedItems.map((item) => item.itemId)).size !== selectedItems.length) {
      setValidationError('Please select each purchase item only once.')
      return
    }

    if (discount > subtotal + additionalCharges) {
      setValidationError('Discount cannot make the final amount negative.')
      return
    }
    if (paidAmount > finalAmount) {
      setValidationError('Paid amount cannot exceed the final amount.')
      return
    }

    const purchase = {
      ...form,
      discount,
      additionalCharges,
      paidAmount,
      items: selectedItems.map(({ itemId, name, quantity, unit, purchasePrice }) => ({
        itemId,
        name,
        quantity,
        unit,
        purchasePrice,
        amount: quantity * purchasePrice,
      })),
    }

    setValidationError('')
    await onSave(purchase)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => { setValidationError(''); onClearError?.() }}
            aria-label="Close error message"
            className="grid size-6 shrink-0 place-items-center rounded-md text-rose-500 hover:bg-rose-100 hover:text-rose-700"
          >
            <FiX />
          </button>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <div>
          <h2 className="font-bold text-slate-900">Purchase Information</h2>
          <p className="mt-0.5 text-xs text-slate-500">Supplier and invoice details</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Supplier <span className="text-rose-500">*</span>
            </span>
            <select
              value={form.supplierId}
              onChange={(event) => updateForm('supplierId', event.target.value)}
              className={inputClass}
            >
              <option value="">Select supplier</option>
              {selectableSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Purchase Date <span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(event) => updateForm('purchaseDate', event.target.value)}
              className={inputClass}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Invoice No. <span className="text-rose-500">*</span>
            </span>
            <input
              type="text"
              value={form.invoiceNo}
              onChange={(event) => updateForm('invoiceNo', event.target.value)}
              placeholder="Enter supplier invoice number"
              className={inputClass}
            />
          </label>

          <label className="sm:col-span-2 xl:col-span-3">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) => updateForm('notes', event.target.value)}
              placeholder="Optional notes about this purchase"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900">Purchase Items</h2>
            <p className="mt-0.5 text-xs text-slate-500">Items included in this supplier purchase</p>
          </div>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, createRow()])}
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-primary/30 px-3 text-sm font-semibold text-primary-dark hover:bg-primary-light"
          >
            <FiPlus /> Add Item
          </button>
        </div>

        <div className="mt-4 hidden grid-cols-[minmax(210px,2fr)_90px_110px_130px_130px_40px] gap-3 border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <span>Item</span>
          <span>Quantity</span>
          <span>Unit</span>
          <span>Purchase Price</span>
          <span>Amount</span>
          <span />
        </div>

        <div>
          {items.map((item) => (
            <PurchaseItemRow
              key={item.rowId}
              item={item}
              availableItems={availableItems}
              onChange={(field, value) => updateItem(item.rowId, field, value)}
              onRemove={() =>
                setItems((current) => current.filter((row) => row.rowId !== item.rowId))
              }
              canRemove={items.length > 1}
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PurchasePayment
          paymentType={form.paymentType}
          paidAmount={form.paidAmount}
          finalAmount={finalAmount}
          onChange={updateForm}
        />
        <PurchaseSummary
          subtotal={subtotal}
          discount={form.discount}
          additionalCharges={form.additionalCharges}
          finalAmount={finalAmount}
          onChange={updateForm}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
        <h2 className="font-bold text-slate-900">Purchase Status</h2>
        <p className="mt-0.5 text-xs text-slate-500">Choose the current stage of this purchase</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-xl sm:grid-cols-4">
          {['Draft', 'Ordered'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => updateForm('purchaseStatus', status)}
              className={`h-10 rounded-lg border text-sm font-semibold ${
                form.purchaseStatus === status
                  ? 'border-primary bg-primary-light text-primary-dark'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Receive or cancel the purchase later from Purchase Details.</p>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          to={initialPurchase ? `/purchases/${initialPurchase.id}` : '/purchases'}
          className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || !availableItems.length}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave /> {submitting ? 'Saving...' : initialPurchase ? 'Update Purchase' : 'Save Purchase'}
        </button>
      </div>
    </form>
  )
}

export default PurchaseForm
