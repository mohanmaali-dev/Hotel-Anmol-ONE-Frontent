import assert from 'node:assert/strict'
import test from 'node:test'

import { createFilePreview, formatFileSize, validateImportFile } from '../src/utils/excelHelpers.js'
import { formatCurrency, setDefaultCurrency } from '../src/utils/orderFormatters.js'
import { convertedQuantity, standardConversionFactor } from '../src/utils/units.js'
import { validateStockInForm, validateStockOutForm } from '../src/utils/stockFormValidation.js'

test('recipe units convert to the stock unit', () => {
  assert.equal(standardConversionFactor('gram', 'kg'), 0.001)
  assert.equal(convertedQuantity({ unit: 'kg' }, 250, 'gram'), 0.25)
  assert.equal(convertedQuantity({ unit: 'litre' }, 500, 'ml'), 0.5)
  assert.equal(convertedQuantity({ unit: 'piece' }, 1, 'gram'), null)
})

test('currency formatting follows restaurant settings', () => {
  setDefaultCurrency('USD')
  assert.match(formatCurrency(125.5), /\$/)
  setDefaultCurrency('INR')
  assert.match(formatCurrency(125.5), /₹/)
})

test('Excel import accepts only safe supported files', () => {
  assert.equal(validateImportFile({ name: 'menu.xlsx', size: 1000 }), '')
  assert.equal(validateImportFile({ name: 'stock.csv', size: 1000 }), '')
  assert.equal(validateImportFile({ name: 'legacy.xls', size: 1000 }), '')
  assert.match(validateImportFile({ name: 'large.xlsx', size: 11 * 1024 * 1024 }), /10 MB/)
  assert.equal(formatFileSize(1024), '1.0 KB')
})

test('legacy .xls files can be previewed before import', async () => {
  const XLSX = await import('xlsx').then((module) => module.default || module)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Supplier Name', 'Contact Person', 'Phone', 'Address', 'Status'],
    ['Fresh Foods', 'Ravi', '9876543210', 'Main Market', 'Active'],
  ])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers')
  const bytes = XLSX.write(workbook, { bookType: 'biff8', type: 'array' })
  const file = new File([bytes], 'suppliers.xls')
  const preview = await createFilePreview(file, {
    id: 'suppliers',
    columns: ['Supplier Name', 'Contact Person', 'Phone', 'Address', 'Status'],
  })
  assert.equal(preview.totalRows, 1)
  assert.equal(preview.validRows[0]['Supplier Name'], 'Fresh Foods')
})

test('stock movement forms reject invalid quantities before calling the API', () => {
  const base = { itemId: 'rice', quantity: 2, purchasePrice: 80, date: '2026-08-26' }
  assert.equal(validateStockInForm(base), '')
  assert.match(validateStockInForm({ ...base, quantity: '' }), /greater than zero/)
  assert.match(validateStockInForm({ ...base, purchasePrice: -1 }), /buying price/)
  assert.equal(validateStockOutForm(base, { currentQuantity: 3, unit: 'kg' }), '')
  assert.match(
    validateStockOutForm({ ...base, quantity: 4 }, { currentQuantity: 3, unit: 'kg' }),
    /Only 3 kg is available/,
  )
})
