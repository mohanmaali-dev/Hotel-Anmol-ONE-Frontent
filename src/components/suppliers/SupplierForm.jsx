import { useState } from 'react'
import { FiAlertCircle, FiSave, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function SupplierForm({ initialSupplier, onSave, submitting = false, apiError = '', onClearError }) {
  const [form, setForm] = useState({
    name: initialSupplier?.name || '',
    contactPerson: initialSupplier?.contactPerson || '',
    phone: String(initialSupplier?.phone || '').replace(/\D/g, ''),
    alternatePhone: String(initialSupplier?.alternatePhone || '').replace(/\D/g, ''),
    email: initialSupplier?.email || '',
    address: initialSupplier?.address || '',
    gstTaxNo: initialSupplier?.gstTaxNo || '',
    notes: initialSupplier?.notes || '',
    isActive: initialSupplier?.isActive ?? true,
  })
  const [error, setError] = useState('')

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const submittedForm = {
      ...form,
      name: String(values.get('name') || '').trim(),
      contactPerson: String(values.get('contactPerson') || '').trim(),
      phone: String(values.get('phone') || '').replace(/\D/g, ''),
      alternatePhone: String(values.get('alternatePhone') || '').replace(/\D/g, ''),
      email: String(values.get('email') || '').trim(),
      gstTaxNo: String(values.get('gstTaxNo') || '').trim(),
      address: String(values.get('address') || '').trim(),
      notes: String(values.get('notes') || '').trim(),
    }
    const missingFields = [
      ['Supplier Name', submittedForm.name],
      ['Contact Person', submittedForm.contactPerson],
      ['Phone', submittedForm.phone],
      ['Address', submittedForm.address],
    ].filter(([, value]) => !value).map(([label]) => label)

    if (missingFields.length) {
      setError(`Please enter ${missingFields.join(', ')}.`)
      return
    }
    if (submittedForm.phone.length < 7 || submittedForm.phone.length > 15) {
      setError('Please enter a valid phone number with 7 to 15 digits.')
      return
    }
    if (submittedForm.alternatePhone && (submittedForm.alternatePhone.length < 7 || submittedForm.alternatePhone.length > 15)) {
      setError('Please enter a valid alternate phone number with 7 to 15 digits.')
      return
    }
    setError('')
    setForm(submittedForm)
    await onSave({ ...initialSupplier, ...submittedForm })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || apiError) && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span className="flex-1">{error || apiError}</span>
          <button type="button" onClick={() => { setError(''); onClearError?.() }} aria-label="Close error message" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <h2 className="font-bold text-slate-900">Supplier Information</h2>
        <p className="mt-0.5 text-xs text-slate-500">Contact, address, and tax details</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Supplier Name</span>
            <input type="text" name="name" autoComplete="organization" value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Enter supplier name" className={inputClass} required />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Contact Person</span>
            <input type="text" name="contactPerson" autoComplete="name" value={form.contactPerson} onChange={(event) => updateForm('contactPerson', event.target.value)} placeholder="Enter contact person" className={inputClass} required />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</span>
            <input type="tel" name="phone" autoComplete="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength="15" value={form.phone} onChange={(event) => updateForm('phone', event.target.value.replace(/\D/g, ''))} placeholder="Enter phone number" className={inputClass} required />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Alternate Phone <span className="font-normal text-slate-400">(optional)</span></span>
            <input type="tel" name="alternatePhone" inputMode="numeric" pattern="[0-9]{7,15}" maxLength="15" value={form.alternatePhone} onChange={(event) => updateForm('alternatePhone', event.target.value.replace(/\D/g, ''))} placeholder="Alternate phone" className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email <span className="font-normal text-slate-400">(optional)</span></span>
            <input type="email" name="email" autoComplete="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="supplier@example.com" className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">GST / Tax No. <span className="font-normal text-slate-400">(optional)</span></span>
            <input type="text" name="gstTaxNo" value={form.gstTaxNo} onChange={(event) => updateForm('gstTaxNo', event.target.value)} placeholder="Enter GST or tax number" className={inputClass} />
          </label>
          <label className="sm:col-span-2 xl:col-span-3">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Address</span>
            <textarea name="address" autoComplete="street-address" rows="3" value={form.address} onChange={(event) => updateForm('address', event.target.value)} placeholder="Enter complete address" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" required />
          </label>
          <label className="sm:col-span-2 xl:col-span-3">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Notes <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea name="notes" rows="3" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Optional supplier notes" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </label>
        </div>

        <fieldset className="mt-5 border-t border-slate-100 pt-5">
          <legend className="mb-2 text-sm font-semibold text-slate-700">Status</legend>
          <div className="grid max-w-sm grid-cols-2 gap-2">
            {[true, false].map((value) => (
              <button key={String(value)} type="button" onClick={() => updateForm('isActive', value)} className={`h-10 rounded-lg border text-sm font-semibold ${form.isActive === value ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{value ? 'Active' : 'Inactive'}</button>
            ))}
          </div>
        </fieldset>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link to={initialSupplier ? `/suppliers/${initialSupplier.id}` : '/suppliers'} className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
        <button type="submit" disabled={submitting} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiSave /> {submitting ? 'Saving...' : initialSupplier ? 'Update Supplier' : 'Save Supplier'}</button>
      </div>
    </form>
  )
}

export default SupplierForm
