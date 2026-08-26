import { FiCheck, FiCheckSquare, FiLock, FiMinus } from 'react-icons/fi'

import { permissionActions, permissionModules } from '../../data/permissionOptions.js'

function RolePermissions({ permissions, onChange, readOnly = false }) {
  const togglePermission = (module, action, checked) => {
    if (readOnly) return
    const modulePermissions = { ...permissions[module] }
    if (action === 'view' && !checked) {
      permissionActions.forEach((item) => { modulePermissions[item] = false })
    } else {
      modulePermissions[action] = checked
      if (action !== 'view' && checked) modulePermissions.view = true
    }
    onChange({ ...permissions, [module]: modulePermissions })
  }

  const toggleModule = (module) => {
    if (readOnly) return
    const hasFullAccess = permissionActions.every((action) => permissions[module]?.[action])
    onChange({
      ...permissions,
      [module]: Object.fromEntries(permissionActions.map((action) => [action, !hasFullAccess])),
    })
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary-dark">{readOnly ? <FiLock /> : <FiCheckSquare />}</span><div><h2 className="font-bold text-slate-900">Page Access</h2><p className="mt-0.5 text-xs text-slate-500">{readOnly ? 'Access currently given to this user.' : 'Choose what this person can see and do on each page.'}</p></div></div>{readOnly && <div className="flex items-center gap-3 pl-12 text-xs font-medium sm:pl-0"><span className="flex items-center gap-1.5 text-emerald-700"><FiCheck /> Allowed</span><span className="flex items-center gap-1.5 text-slate-500"><FiMinus /> No access</span></div>}</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Module</th>{permissionActions.map((action) => <th key={action} className="px-4 py-3 text-center">{action}</th>)}{!readOnly && <th className="px-5 py-3 text-right">Full Access</th>}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {permissionModules.map((module) => (
              <tr key={module} className="text-slate-700"><td className="px-5 py-3 font-semibold capitalize text-slate-900">{module}</td>{permissionActions.map((action) => { const allowed = Boolean(permissions[module]?.[action]); return <td key={action} className="px-4 py-3 text-center">{readOnly ? <span role="img" aria-label={`${module} ${action}: ${allowed ? 'allowed' : 'not allowed'}`} title={allowed ? 'Allowed' : 'Not allowed'} className={`mx-auto grid size-7 place-items-center rounded-md border ${allowed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>{allowed ? <FiCheck /> : <FiMinus />}</span> : <input type="checkbox" checked={allowed} onChange={(event) => togglePermission(module, action, event.target.checked)} aria-label={`${module} ${action} permission`} className="size-4 rounded border-slate-300 accent-[var(--color-primary)]" />}</td>})}{!readOnly && <td className="px-5 py-3 text-right"><button type="button" onClick={() => toggleModule(module)} className="rounded-md px-2.5 py-1 text-xs font-semibold text-primary-dark hover:bg-primary-light">Toggle all</button></td>}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RolePermissions
