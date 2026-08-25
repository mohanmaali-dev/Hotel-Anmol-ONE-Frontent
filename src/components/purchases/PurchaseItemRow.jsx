import { FiTrash2 } from 'react-icons/fi'

import { formatCurrency } from '../../utils/orderFormatters.js'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function PurchaseItemRow({ item, availableItems, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 py-4 last:border-0 md:grid-cols-[minmax(210px,2fr)_90px_110px_130px_130px_40px] md:items-end">
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 md:sr-only">Item</span>
        <select
          value={item.itemId}
          onChange={(event) => onChange('itemId', event.target.value)}
          className={inputClass}
        >
          <option value="">Select item</option>
          {availableItems.map((availableItem) => (
            <option key={availableItem.id} value={availableItem.id}>
              {availableItem.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 md:sr-only">Quantity</span>
        <input
          type="number"
          min="0.001"
          step="0.001"
          value={item.quantity}
          onChange={(event) => onChange('quantity', event.target.value)}
          className={inputClass}
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 md:sr-only">Unit</span>
        <input
          type="text"
          value={item.unit}
          readOnly
          className={`${inputClass} bg-slate-50 text-slate-500`}
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 md:sr-only">
          Price per {item.unit}
        </span>
        <input
          type="number"
          min="0"
          value={item.purchasePrice}
          onChange={(event) => onChange('purchasePrice', event.target.value)}
          className={inputClass}
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600 md:sr-only">Amount</span>
        <input
          type="text"
          value={formatCurrency(item.quantity * item.purchasePrice)}
          readOnly
          className={`${inputClass} bg-slate-50 font-semibold text-slate-800`}
        />
      </label>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove purchase item"
        title="Remove item"
        className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiTrash2 />
      </button>
    </div>
  )
}

export default PurchaseItemRow
