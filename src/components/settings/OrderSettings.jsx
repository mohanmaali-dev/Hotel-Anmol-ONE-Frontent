import { FiShoppingBag } from 'react-icons/fi'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function SettingToggle({ label, description, enabled, onChange }) {
  return <div><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><button type="button" onClick={() => onChange(!enabled)} role="switch" aria-checked={enabled} className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition-colors ${enabled ? 'border-primary/30 bg-primary-light/60 text-primary-dark' : 'border-slate-200 bg-white text-slate-600'}`}><span>{enabled ? 'Enabled' : 'Disabled'}</span><span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-slate-300'}`}><span className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} /></span></button><span className="mt-1 block text-xs text-slate-400">{description}</span></div>
}

function OrderSettings({ settings, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700"><FiShoppingBag /></span><div><h2 className="font-bold text-slate-900">Order Settings</h2><p className="mt-0.5 text-xs text-slate-500">Choose order defaults and numbering behavior</p></div></div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Default Order Type</span><select value={settings.defaultOrderType} onChange={(event) => onChange('defaultOrderType', event.target.value)} className={inputClass}><option>Dine In</option><option>Parcel</option><option>Room</option></select><span className="mt-1 block text-xs text-slate-400">Preselected when creating a new order.</span></label>
        <SettingToggle label="Auto Generate Order Number" description="Create the next order number automatically." enabled={settings.autoGenerateOrderNumber} onChange={(value) => onChange('autoGenerateOrderNumber', value)} />
        <SettingToggle label="Auto Generate Bill Number" description="Create a bill number when the bill is generated." enabled={settings.autoGenerateBillNumber} onChange={(value) => onChange('autoGenerateBillNumber', value)} />
      </div>
    </section>
  )
}

export default OrderSettings
