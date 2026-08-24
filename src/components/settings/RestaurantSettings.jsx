import { FiMapPin } from 'react-icons/fi'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function RestaurantSettings({ settings, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiMapPin /></span><div><h2 className="font-bold text-slate-900">Restaurant Information</h2><p className="mt-0.5 text-xs text-slate-500">Details shown on bills and restaurant records</p></div></div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Restaurant Name</span><input type="text" value={settings.name} onChange={(event) => onChange('name', event.target.value)} className={inputClass} /></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</span><input type="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength="15" value={settings.phone} onChange={(event) => onChange('phone', event.target.value.replace(/\D/g, ''))} className={inputClass} /></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span><input type="email" value={settings.email} onChange={(event) => onChange('email', event.target.value)} className={inputClass} /></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">GST / Tax Number</span><input type="text" value={settings.gstTaxNumber} onChange={(event) => onChange('gstTaxNumber', event.target.value)} className={inputClass} /></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Currency</span><select value={settings.currency} onChange={(event) => onChange('currency', event.target.value)} className={inputClass}><option value="INR">Indian Rupee (₹)</option><option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option><option value="GBP">British Pound (£)</option></select></label>
        <label className="sm:col-span-2 xl:col-span-3"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Address</span><textarea rows="3" value={settings.address} onChange={(event) => onChange('address', event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
      </div>
    </section>
  )
}

export default RestaurantSettings
