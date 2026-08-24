import { FiTrash2 } from 'react-icons/fi'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function IngredientRow({ ingredient, stockItems, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 last:border-0 sm:grid-cols-[minmax(200px,2fr)_130px_120px_40px] sm:items-end">
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 sm:sr-only">
          Stock Item
        </span>
        <select
          value={ingredient.stockItemId}
          onChange={(event) => onChange('stockItemId', event.target.value)}
          className={inputClass}
        >
          <option value="">Select stock item</option>
          {stockItems.map((stockItem) => (
            <option key={stockItem.id} value={stockItem.id}>
              {stockItem.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 sm:sr-only">
          Quantity Used
        </span>
        <input
          type="number"
          min="0.001"
          step="0.001"
          value={ingredient.quantityUsed}
          onChange={(event) => onChange('quantityUsed', event.target.value)}
          className={inputClass}
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 sm:sr-only">Unit</span>
        <input
          type="text"
          value={ingredient.unit || '—'}
          readOnly
          className={`${inputClass} bg-slate-50 text-slate-500`}
        />
      </label>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove ingredient"
        title="Remove ingredient"
        className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiTrash2 />
      </button>
    </div>
  )
}

export default IngredientRow
