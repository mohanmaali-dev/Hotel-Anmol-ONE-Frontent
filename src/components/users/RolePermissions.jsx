import { FiCheckSquare, FiLock } from 'react-icons/fi'

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
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary-dark">{readOnly ? <FiLock /> : <FiCheckSquare />}</span><div><h2 className="font-bold text-slate-900">Page Access</h2><p className="mt-0.5 text-xs text-slate-500">Choose what this person can see and do on each page.</p></div></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Module</th>{permissionActions.map((action) => <th key={action} className="px-4 py-3 text-center">{action}</th>)}{!readOnly && <th className="px-5 py-3 text-right">Full Access</th>}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {permissionModules.map((module) => (
              <tr key={module} className="text-slate-700"><td className="px-5 py-3 font-semibold capitalize text-slate-900">{module}</td>{permissionActions.map((action) => <td key={action} className="px-4 py-3 text-center"><input type="checkbox" checked={Boolean(permissions[module]?.[action])} onChange={(event) => togglePermission(module, action, event.target.checked)} disabled={readOnly} aria-label={`${module} ${action} permission`} className="size-4 rounded border-slate-300 accent-[var(--color-primary)] disabled:opacity-70" /></td>)}{!readOnly && <td className="px-5 py-3 text-right"><button type="button" onClick={() => toggleModule(module)} className="rounded-md px-2.5 py-1 text-xs font-semibold text-primary-dark hover:bg-primary-light">Toggle all</button></td>}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RolePermissions
