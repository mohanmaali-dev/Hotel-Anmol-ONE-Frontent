import { FiShoppingBag } from 'react-icons/fi'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function OrderSettings({ settings, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700"><FiShoppingBag /></span><div><h2 className="font-bold text-slate-900">Order Settings</h2><p className="mt-0.5 text-xs text-slate-500">Choose order defaults and numbering behavior</p></div></div>
      <div className="mt-5 max-w-md">
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Default Order Type</span><select value={settings.defaultOrderType} onChange={(event) => onChange('defaultOrderType', event.target.value)} className={inputClass}><option>Dine In</option><option>Parcel</option><option>Room</option></select><span className="mt-1 block text-xs text-slate-400">Preselected when creating a new order.</span></label>
      </div>
    </section>
  )
}

export default OrderSettings
