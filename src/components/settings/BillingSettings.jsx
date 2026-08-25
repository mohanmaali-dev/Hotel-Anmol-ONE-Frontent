import { FiCreditCard } from 'react-icons/fi'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition-colors ${
        enabled
          ? 'border-primary/30 bg-primary-light/60 text-primary-dark'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

function BillingSettings({ settings, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><FiCreditCard /></span><div><h2 className="font-bold text-slate-900">Billing Settings</h2><p className="mt-0.5 text-xs text-slate-500">Default values used when creating bills</p></div></div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Bill Prefix</span><input type="text" value={settings.billPrefix} onChange={(event) => onChange('billPrefix', event.target.value.toUpperCase())} className={inputClass} /></label>
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Default Additional Charge</span><input type="number" min="0" step="0.01" value={settings.defaultAdditionalCharge} onChange={(event) => onChange('defaultAdditionalCharge', event.target.value)} className={inputClass} /></label>
        <div><span className="mb-1.5 block text-sm font-semibold text-slate-700">Allow Discount</span><Toggle enabled={settings.allowDiscount} onChange={(value) => onChange('allowDiscount', value)} label={settings.allowDiscount ? 'Enabled' : 'Disabled'} /></div>
        <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Footer Message</span><input type="text" value={settings.footerMessage} onChange={(event) => onChange('footerMessage', event.target.value)} className={inputClass} /></label>
      </div>
    </section>
  )
}

export default BillingSettings
