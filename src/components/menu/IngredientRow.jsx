import { FiTrash2 } from 'react-icons/fi'
import { compatibleUnits, convertedQuantity } from '../../utils/units.js'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

const unitName = (unit) => unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : '—'

function IngredientRow({ ingredient, stockItems, onChange, onRemove, canRemove }) {
  const selectedItem = stockItems.find((item) => item.id === ingredient.stockItemId)
  const stockQuantity = convertedQuantity(selectedItem, ingredient.quantityUsed, ingredient.unit)
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-[minmax(200px,2fr)_130px_145px_180px_40px] md:items-start">
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Ingredient
        </span>
        <select
          value={ingredient.stockItemId}
          onChange={(event) => onChange('stockItemId', event.target.value)}
          className={inputClass}
        >
          <option value="">Select stock item</option>
          {stockItems.map((stockItem) => (
            <option key={stockItem.id} value={stockItem.id}>
              {stockItem.name} ({unitName(stockItem.unit)})
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Quantity per Item
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
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Deduction Unit</span>
        <select value={ingredient.unit} onChange={(event) => onChange('unit', event.target.value)} className={inputClass}>
          {compatibleUnits(selectedItem).map((unit) => <option key={unit} value={unit}>{unitName(unit)}</option>)}
        </select>
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Stock Unit</span>
        <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
          {unitName(selectedItem?.unit)}
        </div>
        {selectedItem && stockQuantity !== null && <p className="mt-1 text-xs font-medium text-primary-dark">Deducts {stockQuantity} {unitName(selectedItem.unit)} from stock</p>}
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove ingredient"
        title="Remove ingredient"
        className="mt-6 grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiTrash2 />
      </button>
    </div>
  )
}

export default IngredientRow
