import { FiEdit2, FiGrid, FiPower, FiTrash2 } from 'react-icons/fi'

function CategoryTable({ categories, onEdit, onToggle, onDelete, total = categories.length, loading = false, canEdit = true, canDelete = false }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">Menu Categories</h2>
        <p className="mt-0.5 text-xs text-slate-500">{total} categories</p>
      </div>

      {loading ? (
        <div className="grid place-items-center px-6 py-14"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading categories...</p></div>
      ) : categories.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Category Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                    {canEdit ? <button type="button" onClick={() => onEdit(category)} className="record-link" title="Open category">{category.name}</button> : category.name}
                  </td>
                  <td className="px-4 py-4">{category.description || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {category.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {canEdit && <button
                        type="button"
                        onClick={() => onEdit(category)}
                        title="Edit category"
                        aria-label={`Edit ${category.name}`}
                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-primary-dark hover:bg-primary-light"
                      >
                        <FiEdit2 />
                      </button>}
                      {canEdit && <button
                        type="button"
                        onClick={() => onToggle(category.id)}
                        title={category.isActive ? 'Disable category' : 'Enable category'}
                        aria-label={`${category.isActive ? 'Disable' : 'Enable'} ${category.name}`}
                        className={`grid size-8 place-items-center rounded-lg border ${
                          category.isActive
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <FiPower />
                      </button>}
                      {canDelete && <button type="button" onClick={() => onDelete(category)} title="Delete category" aria-label={`Delete ${category.name}`} className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><FiTrash2 /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-14 text-center">
          <FiGrid className="text-2xl text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">No categories found</p>
        </div>
      )}
    </section>
  )
}

export default CategoryTable
