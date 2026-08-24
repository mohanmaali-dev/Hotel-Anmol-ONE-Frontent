import { FiBox } from 'react-icons/fi'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function StockAlertToggle({ enabled, onChange }) {
  return <div><span className="mb-1.5 block text-sm font-semibold text-slate-700">Low Stock Alert</span><button type="button" onClick={() => onChange(!enabled)} role="switch" aria-checked={enabled} className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition-colors ${enabled ? 'border-primary/30 bg-primary-light/60 text-primary-dark' : 'border-slate-200 bg-white text-slate-600'}`}><span>{enabled ? 'Enabled' : 'Disabled'}</span><span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-slate-300'}`}><span className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} /></span></button><span className="mt-1 block text-xs text-slate-400">Show a warning when stock reaches its minimum.</span></div>
}

function StockSettings({ settings, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><FiBox /></span><div><h2 className="font-bold text-slate-900">Stock Settings</h2><p className="mt-0.5 text-xs text-slate-500">Configure simple low-stock reminders</p></div></div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StockAlertToggle enabled={settings.lowStockAlertEnabled} onChange={(value) => onChange('lowStockAlertEnabled', value)} />
        <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Default Minimum Stock</span><input type="number" min="0" step="1" value={settings.defaultMinimumStock} onChange={(event) => onChange('defaultMinimumStock', event.target.value)} className={inputClass} /><span className="mt-1 block text-xs text-slate-400">Used as the starting minimum for new stock items.</span></label>
      </div>
    </section>
  )
}

export default StockSettings
